import React, { useState, useRef } from 'react'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

export default function ScaleToggle(props) {
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('1');
  const appRef = props.appRef;

  const radios = [
    { name: 'Linear', value: '1' },
    { name: 'Logarithmic', value: '2' },
  ];

  return (
    <>
      <ButtonGroup toggle>
        {radios.map((radio, idx) => (
          <ToggleButton
            key={idx}
            type="radio"
            variant="secondary"
            name="radio"
            value={radio.value}
            checked={radioValue === radio.value}
            onChange={async (e) => {
              await setRadioValue(e.currentTarget.value);
              if (appRef.state.currentClusterJSON) {
                console.log("Boola boola boola");
                appRef.changeScale(idx+1);
              }
            }}
          >
            {radio.name}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </>
  );
}
