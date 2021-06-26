import React, {useState} from "react";
import DarkModeToggle from "react-dark-mode-toggle";

export default (props) => {
    const [isDarkMode, setIsDarkMode] = useState(() => true);
    let appRef = props.appRef;
    return (
    <DarkModeToggle
          onChange={async () => {
                await setIsDarkMode(!isDarkMode);
                console.log(+isDarkMode)
                appRef.changeMode(+isDarkMode);
          }}
      checked={isDarkMode}
            size={60}
            speed={2}
    />
  );
};