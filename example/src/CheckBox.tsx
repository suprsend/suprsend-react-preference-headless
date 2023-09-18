import * as React from 'react';

function Circle({ selected, disabled }) {
  const bgColor = selected
    ? disabled
      ? '#BDCFF8'
      : '#2463EB'
    : disabled
    ? '#D0CFCF'
    : '#FFF';

  return (
    <div
      style={{
        height: 20,
        width: 20,
        borderRadius: 100,
        border: '0.5px solid #A09F9F',
        backgroundColor: bgColor,
        marginTop: 3.6,
      }}
    />
  );
}

export default function Checkbox({ title, onClick, disabled, selected }) {
  return (
    <div
      style={{
        border: '0.5px solid #B5B5B5',
        display: 'inline-flex',
        padding: '0px 20px 0px 4px',
        borderRadius: 30,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={onClick}
    >
      <Circle selected={selected} disabled={disabled} />
      <p
        style={{
          marginLeft: 8,
          color: '#6C727F',
          fontWeight: 500,
          paddingBottom: 4,
          marginTop: 3,
          marginBottom: 4,
        }}
      >
        {title}
      </p>
    </div>
  );
}
