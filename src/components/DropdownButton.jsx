import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { StickerTypes } from '../enums/StickerTypes';

export default function DropdownButton({children, className, onClick, title, options, onChange}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [selected, setSelected] = useState(StickerTypes.DEFAULT);
    
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

    const classNameNullchecked = className ? className : "";

    const toggleOpen = (event) => {
        event.stopPropagation();
        setIsOpen(!isOpen);
    }

    return (
        <button className={"dropdown-button " + classNameNullchecked} onClick={onClick} title={title}>
            {children}
            <span onClick={toggleOpen} className={`arrow ${isOpen ? "up" : "down"}`}></span>
            {isOpen && (
                <ul ref={dropdownRef} className="dropdown">
                    {options.map((option) => {
                        if (option.id == selected) return (<li className="selected-option" key={option.id} onClick={() => handleSelect(option.id)}>
                            {option.label}
                        </li>);
                        else return (<li key={option.id} onClick={() => handleSelect(option.id)}>
                            {option.label}
                        </li>);
                    })}
                </ul>
            )}
        </button>
    )
}