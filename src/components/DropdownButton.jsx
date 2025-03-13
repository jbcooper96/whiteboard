import React from 'react';
import { useState, useRef, useEffect } from 'react';

export default function DropdownButton({children, className, onClick, title, options, onChange, active, defaultValue}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [selected, setSelected] = useState(defaultValue);
    
    const handleSelect = (option) => {
        setIsOpen(false);
        if (onChange && option !== selected) {
            onChange(option);
        }
        setSelected(option);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const activeClassname = active ? "active" : "";

    const toggleOpen = (event) => {
        event.stopPropagation();
        setIsOpen(!isOpen);
    }

    const clickHandler = (event) => {
        if (active) {
            toggleOpen(event);
        }
        else {
            onClick(event);
        }
    }

    console.log(options);

    return (
        <button className={"dropdown-button " + activeClassname} onClick={clickHandler} title={title}>
            {children}
            <span onClick={toggleOpen} className={`arrow ${isOpen ? "up" : "down"}`}></span>
            {isOpen && (
                <ul ref={dropdownRef} className="dropdown">
                    {options.map((option) => {
                        if (option.id == selected) return (<li className="selected-option" key={option.id} onClick={() => handleSelect(option.id)}>
                            {option.icon || option.label}
                            {option.icon && option.icon()}
                        </li>);
                        else return (<li key={option.id} onClick={() => handleSelect(option.id)}>
                            {option.icon || option.label}
                            {option.icon && option.icon()}
                        </li>);
                    })}
                </ul>
            )}
        </button>
    )
}