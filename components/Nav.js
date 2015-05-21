'use strict';
import React from 'react';
import {NavLink} from 'fluxible-router';

class Nav extends React.Component {
    componentDidMount(){
        let currentComp = this.refs.defaultNavbar.getDOMNode();
        $(currentComp).find('.ui.dropdown').dropdown();
    }
    showHelpModal() {
        /*global $*/
        $('.ui.modal').modal('show');
    }
    render() {
        let user = this.context.getUser();
        let userMenu;
        if(user){
            userMenu = <div className="ui right dropdown item">
                            {user.accountName} <i className="dropdown icon"></i>
                            <div className="menu">
                                <a href="/profile" className="item">Profile</a>
                                {parseInt(user.isSuperUser)? <a href="/users" className="item">Users List</a> : ''}
                                <a href="/logout" className="item">Logout</a>
                            </div>
                        </div>;
        }
        return (
            <nav ref="defaultNavbar" className="ui blue menu inverted navbar page grid">
                    <NavLink routeName="home" className="brand item" activeClass="active"><img className="ui mini image" src="/assets/img/ld-reactor.gif" alt="ld-reactor" /></NavLink>
                    <NavLink routeName="about" className="item" activeClass="active">About LD-Reactor</NavLink>
                    <NavLink routeName="dataset" className="item" activeClass="active" href="/dataset">Default Dataset</NavLink>
                    {userMenu}
                    <div className="ui right item link" onClick={this.showHelpModal}>
                            <i className="small help circle icon"></i>
                    </div>
            </nav>
        );
    }
}
Nav.contextTypes = {
    getUser: React.PropTypes.func
};
export default Nav;
