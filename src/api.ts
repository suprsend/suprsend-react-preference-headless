// @ts-nocheck
import { useConfigStore, usePreferenceStore } from './state';
import { debounce_by_type, decode_jwt } from './utils';
import mitt from 'mitt';
import { IPreferenceAPIReponse } from './types';

export enum PreferenceOptions {
  OPT_IN = 'opt_in',
  OPT_OUT = 'opt_out',
}

export enum ChannelLevelPreferenceOptions {
  ALL = 'all',
  REQUIRED = 'required',
}

export default class PreferencesApi {
  constructor() {
    const config = useConfigStore.getState();

    this._emitter = mitt();

    this._debounced_update_category_preferences = debounce_by_type(
      this._update_category_preferences,
      config.preference_debounce
    );
    this._debounced_update_channel_preferences = debounce_by_type(
      this._update_channel_preferences,
      config.preference_debounce
    );
  }

  get emitter() {
    return this._emitter;
  }

  _validate_query_params(query_params = {}) {
    let validated_params = {};
    for (let key in query_params) {
      if (query_params[key]) {
        validated_params[key] = query_params[key];
      }
    }
    return validated_params;
  }

  async _get_request(route = '', query_params = {}) {
    const config = useConfigStore.getState();
    const preference_base_url = `/v1/subscriber/${config.distinct_id}`;
    const validated_query_params = this._validate_query_params(query_params);
    const query_params_string = new URLSearchParams(
      validated_query_params
    ).toString();

    const full_url_path = query_params_string
      ? `${preference_base_url}/${route}/?${query_params_string}`
      : `${preference_base_url}/${route}`;

    const requested_date = new Date().toGMTString();

    try {
      const resp = await fetch(`${config.api_url}${full_url_path}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this._get_auth_token(config),
          'x-amz-date': requested_date,
        },
      });
      if (resp.ok) {
        return resp.json();
      }
      const error_data = await resp.json();
      return {
        error: true,
        is_api_error: true,
        status_code: resp.status,
        response: { message: error_data?.message, type: error_data?.type },
      };
    } catch (e) {
      return {
        error: true,
        is_api_error: false,
        status_code: null,
        response: { message: e?.message, type: e?.name },
      };
    }
  }

  async _update_request(body, route, query_params) {
    const config = useConfigStore.getState();
    const preference_base_url = `/v1/subscriber/${config.distinct_id}`;
    const validated_query_params = this._validate_query_params(query_params);
    const query_params_string = new URLSearchParams(
      validated_query_params
    ).toString();

    const full_url_path = query_params_string
      ? `${preference_base_url}/${route}/?${query_params_string}`
      : `${preference_base_url}/${route}`;

    const requested_date = new Date().toGMTString();
    const bodyString = JSON.stringify(body);

    try {
      const resp = await fetch(`${config.api_url}${full_url_path}`, {
        method: 'POST',
        body: bodyString,
        headers: {
          'Content-Type': 'application/json',
          Authorization: this._get_auth_token(config),
          'x-amz-date': requested_date,
        },
      });
      if (resp.ok) {
        return resp.json();
      }
      const error_data = await resp.json();
      return {
        error: true,
        is_api_error: true,
        status_code: resp.status,
        response: { message: error_data?.message, type: error_data?.type },
      };
    } catch (e) {
      return {
        error: true,
        api_error: false,
        status_code: null,
        response: { message: e?.message, type: e?.name },
      };
    }
  }

  _update_category_preferences = async (
    category = '',
    body = {},
    subcategory,
    args = {}
  ) => {
    let url_path = `category/${category}`;
    const response: IPreferenceAPIReponse = await this._update_request(
      body,
      url_path,
      args
    );
    if (response?.error) {
      this._emitter.emit('preferences_error', response);
    } else {
      Object.assign(subcategory, response);
      this.data = { ...this.data };
    }
    return response;
  };

  _update_channel_preferences = async (body = {}) => {
    let url_path = 'channel_preference';
    const response: IPreferenceAPIReponse = await this._update_request(
      body,
      url_path
    );
    if (response?.error) {
      this._emitter.emit('preferences_error', response);
    } else {
      await this.get_preferences();
    }
    return response;
  };

  set data(value: any) {
    usePreferenceStore.setState(() => ({ ...value }));
  }

  get data() {
    return usePreferenceStore.getState();
  }

  _validate(config) {
    if (!config.distinct_id) {
      return {
        error: true,
        response: { message: 'distinct_id missing', type: 'VALIDATION_ERROR' },
      };
    } else if (!config.user_token) {
      return {
        error: true,
        response: { message: 'user_token missing', type: 'VALIDATION_ERROR' },
      };
    } else if (!config.workspace_key) {
      return {
        error: true,
        response: {
          message: 'workspace_key missing',
          type: 'VALIDATION_ERROR',
        },
      };
    }
  }

  _get_auth_token(config) {
    const header_prefix = 'SS_JWT';
    return `${header_prefix} ${config.workspace_key}:${config.user_token}`;
  }

  async get_preferences(): Promise<IPreferenceAPIReponse> {
    const config = useConfigStore.getState();

    const error = this._validate(config);
    if (error) return error;

    let url_path = 'full_preference';
    let query_params = { tenant_id: config.tenant_id || 'default' };

    const response = await this._get_request(url_path, query_params);
    if (!response?.error) {
      this.data = response;
    }
    return response;
  }

  update_category_preference(
    category = '',
    preference = ''
  ): IPreferenceAPIReponse {
    if (
      !category ||
      ![PreferenceOptions.OPT_IN, PreferenceOptions.OPT_OUT].includes(
        preference
      )
    ) {
      return {
        error: true,
        response: {
          type: 'VALIDATION_ERROR',
          message: !category
            ? 'Category parameter is missing'
            : 'Preference parameter is invalid',
        },
      };
    }

    if (!this.data) {
      return {
        error: true,
        response: {
          type: 'VALIDATION_ERROR',
          message: 'Call get_preferences method before performing action',
        },
      };
    }

    const config = useConfigStore.getState();

    const error = this._validate(config);
    if (error) return error;

    const jwt_payload = decode_jwt(config.user_token);
    const has_expired = Date.now() >= (jwt_payload.exp - 3) * 1000;
    if (has_expired) {
      return {
        error: true,
        response: {
          type: 'TOKEN_EXPIRED',
          message: 'Token is expired',
        },
      };
    }

    let category_data;
    let data_updated = false;

    // optimistic update in local store
    for (let section of this.data.sections) {
      let abort = false;
      for (let subcategory of section.subcategories) {
        if (subcategory.category === category) {
          category_data = subcategory;
          if (subcategory.is_editable) {
            if (subcategory.preference !== preference) {
              subcategory.preference = preference;
              data_updated = true;
              abort = true;
              break;
            } else {
              // console.log(`category is already ${status}ed`);
            }
          } else {
            return {
              error: true,
              response: {
                type: 'VALIDATION_ERROR',
                message: 'Category preference is not editable',
              },
            };
          }
        }
      }
      if (abort) break;
    }

    if (!category_data) {
      return {
        error: true,
        response: {
          type: 'VALIDATION_ERROR',
          message: 'Category is not found',
        },
      };
    }

    if (!data_updated) {
      return this.data;
    }

    const opt_out_channels = [];
    category_data.channels.forEach(channel => {
      if (channel.preference === PreferenceOptions.OPT_OUT) {
        opt_out_channels.push(channel.channel);
      }
    });

    const request_payload = {
      preference: category_data.preference,
      opt_out_channels,
    };

    this._debounced_update_category_preferences(
      category,
      category,
      request_payload,
      category_data,
      { tenant_id: config.tenant_id || 'default' }
    );

    this.data = this.data;
    return this.data;
  }

  update_channel_preference_in_category(
    channel = '',
    preference = '',
    category = ''
  ): IPreferenceAPIReponse {
    if (!channel || !category) {
      return {
        error: true,
        response: {
          type: 'VALIDATION_ERROR',
          message: !channel
            ? 'Channel parameter is missing'
            : 'Category parameter is missing',
        },
      };
    } else if (
      ![PreferenceOptions.OPT_IN, PreferenceOptions.OPT_OUT].includes(
        preference
      )
    ) {
      return {
        error: true,
        response: {
          type: 'VALIDATION_ERROR',
          message: 'Preference parameter is invalid',
        },
      };
    }

    if (!this.data) {
      return {
        error: true,
        response: {
          type: 'VALIDATION_ERROR',
          message: 'Call get_preferences method before performing action',
        },
      };
    }

    const config = useConfigStore.getState();

    const error = this._validate(config);
    if (error) return error;

    const jwt_payload = decode_jwt(config.user_token);
    const has_expired = Date.now() >= (jwt_payload.exp - 3) * 1000;
    if (has_expired) {
      return {
        error: true,
        response: {
          type: 'TOKEN_EXPIRED',
          message: 'Token is expired',
        },
      };
    }

    let category_data;
    let selected_channel_data;
    let data_updated = false;

    // optimistic update in local store
    for (let section of this.data.sections) {
      let abort = false;
      for (let subcategory of section.subcategories) {
        if (subcategory.category === category) {
          category_data = subcategory;
          for (let channel_data of subcategory.channels) {
            if (channel_data.channel === channel) {
              selected_channel_data = channel_data;
              if (channel_data.is_editable) {
                if (channel_data.preference !== preference) {
                  channel_data.preference = preference;
                  if (preference === PreferenceOptions.OPT_IN) {
                    subcategory.preference = PreferenceOptions.OPT_IN;
                  }
                  data_updated = true;
                  abort = true;
                  break;
                } else {
                  //  console.log(`channel is already ${preference}`);
                }
              } else {
                return {
                  error: true,
                  response: {
                    message: 'Channel preference is not editable',
                    type: 'VALIDATION_ERROR',
                  },
                };
              }
            }
          }
        }
        if (abort) break;
      }
      if (abort) break;
    }

    if (!category_data) {
      return {
        error: true,
        response: {
          message: 'Category not found',
          type: 'VALIDATION_ERROR',
        },
      };
    }

    if (!selected_channel_data) {
      return {
        error: true,
        response: {
          message: "Category's Channel not found",
          type: 'VALIDATION_ERROR',
        },
      };
    }

    if (!data_updated) {
      return this.data;
    }

    const opt_out_channels = [];
    category_data.channels.forEach(channel => {
      if (channel.preference === PreferenceOptions.OPT_OUT) {
        opt_out_channels.push(channel.channel);
      }
    });

    const request_payload = {
      preference: category_data.preference,
      opt_out_channels,
    };

    this._debounced_update_category_preferences(
      category,
      category,
      request_payload,
      category_data,
      { tenant_id: config.tenant_id || 'default' }
    );

    this.data = this.data;
    return this.data;
  }

  update_overall_channel_preference(
    channel = '',
    preference = ''
  ): IPreferenceAPIReponse {
    if (
      !channel ||
      ![
        ChannelLevelPreferenceOptions.ALL,
        ChannelLevelPreferenceOptions.REQUIRED,
      ].includes(preference)
    ) {
      return {
        error: true,
        response: {
          type: 'VALIDATION_ERROR',
          message: !channel
            ? 'Channel parameter is missing'
            : 'Preference parameter is invalid',
        },
      };
    }

    if (!this.data) {
      return {
        error: true,
        response: {
          type: 'VALIDATION_ERROR',
          message: 'Call get_preferences method before performing action',
        },
      };
    }

    const config = useConfigStore.getState();

    const error = this._validate(config);
    if (error) return error;

    const jwt_payload = decode_jwt(config.user_token);
    const has_expired = Date.now() >= (jwt_payload.exp - 3) * 1000;
    if (has_expired) {
      return {
        error: true,
        response: {
          type: 'TOKEN_EXPIRED',
          message: 'Token is expired',
        },
      };
    }

    let channel_data;
    let data_updated = false;
    const preference_restricted =
      preference === ChannelLevelPreferenceOptions.REQUIRED;

    for (let channel_item of this.data.channel_preferences) {
      if (channel_item.channel === channel) {
        channel_data = channel_item;
        if (channel_item.is_restricted !== preference_restricted) {
          channel_item.is_restricted = preference_restricted;
          data_updated = true;
          break;
        }
      }
    }

    if (!channel_data) {
      return {
        error: true,
        response: {
          message: 'Channel data not found',
          type: 'VALIDATION_ERROR',
        },
      };
    }

    if (!data_updated) {
      return this.data;
    }

    this._debounced_update_channel_preferences(channel_data.channel, {
      channel_preferences: [channel_data],
    });

    this.data = this.data;
    return this.data;
  }
}
