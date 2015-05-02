'use strict';
import React from 'react';
import {NavLink} from 'fluxible-router';

class Nav extends React.Component {
    render() {
        return (
            <nav ref="defaultNavbar" className="ui blue menu inverted navbar page grid">
                    <NavLink routeName="home" className="brand item" activeClass="active">LD-Reactor</NavLink>
                    <NavLink routeName="about" className="item" activeClass="active">About</NavLink>
            </nav>
        );
    }
}

export default Nav;
