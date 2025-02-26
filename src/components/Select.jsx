import React, { useState, useRef, useEffect } from "react";

export default function Select({ options, defaultValue, onChange }) {
    const [selected, setSelected] = useState(defaultValue || options[0]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
        if (onChange) {
            onChange(option);
        }
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

    return (
        <div className="select" ref={dropdownRef}>
            <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
                {selected}
                <span className={`arrow ${isOpen ? "up" : "down"}`}></span>
            </div>

            {isOpen && (
                <ul className="dropdown">
                    {options.map((option) => (
                        <li key={option.id} onClick={() => handleSelect(option.id)}>
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};