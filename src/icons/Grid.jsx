import React from 'react'
import { COLOR_DARK } from "../constants";

export default function Grid() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={COLOR_DARK} viewBox="0 0 256 256"><path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,80H136V56h64ZM120,56v64H56V56ZM56,136h64v64H56Zm144,64H136V136h64v64Z"></path></svg>)
}