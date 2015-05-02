'use strict';
var React = require('react');
var NavLink = require('flux-router-component').NavLink;

class Nav extends React.Component {
    render() {
        const selected = this.props.selected;
        const links = this.props.links;

        const linkHTML = Object.keys(links).map(function (name) {
            var className = 'item';
            var link = links[name];

            if (selected === name) {
                className += ' active';
            }
            if (name === 'home') {
                className += ' brand';
            }
            return (
                <div className={className} key={link.path}>
                    <NavLink routeName={link.page}>{link.label}</NavLink>
                </div>
            );
        });

        return (
            <nav ref="defaultNavbar" className="ui blue menu inverted navbar page grid">
                {linkHTML}
            </nav>
        );
    }
}

Nav.defaultProps = {
    selected: 'home',
    links: {}
};

module.exports = Nav;
