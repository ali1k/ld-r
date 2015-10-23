import React from 'react';
import activateUser from '../../actions/activateUser';

import UserStore from '../../stores/UserStore';
import {connectToStores} from 'fluxible-addons-react';
import {NavLink} from 'fluxible-router';

class UsersList extends React.Component {
    activateUser(uri, email){
        this.context.executeAction(activateUser, {
          resourceURI: uri,
          email: email
        });
    }
    render() {
      let actBtn, emailHint = 0, list, dbClass = 'yellow user icon', user = this.context.getUser();
      let currentComponent = this;
      if(!user || !parseInt(user.isSuperUser)){
          return (
              <div className="ui page grid">
                <div className="row">
                  <div className="column">
                    <h1 className="ui header">Permission denied!</h1>
                      <div className="ui segment">
                          <div className="ui warning message"><div className="header">Sorry! You do not have enough permission to access this page!</div></div>
                      </div>
                  </div>
                </div>
              </div>
          )
      }
      let i = 0;
      if(this.props.UserStore.users){
        list = this.props.UserStore.users.map(function(node, index) {
            if(parseInt(node.isActive)){
                dbClass='green large user icon';
                actBtn ='';
            }else{
                dbClass='yellow large user icon';
                actBtn = <div className="item"><button onClick={currentComponent.activateUser.bind(currentComponent, node.v, node.mbox)} className="ui mini button"> Activate </button></div>;
                // put the flag
                emailHint = 1;
            }
            //do not show current super user to edit himself
            if(node.v !== user.id && !parseInt(node.isSuperUser)){
                i++;
                return (
                  <div className="item animated fadeIn" key={index}>
                      <div className="ui horizontal list">
                          <NavLink className="item" routeName="resource" href={'/dataset/'+ encodeURIComponent(currentComponent.props.UserStore.graphName) +'/resource/' + encodeURIComponent(node.v)} >
                          <div className="content"> <span className="ui blue circular label">{i}</span> <i className={dbClass}></i> {node.title} </div>
                          </NavLink>
                           {actBtn}
                      </div>
                  </div>
                )
            }
        });
      }else{
        list=<div className="ui warning message"><div className="header"> Sorry! No user found!</div></div>
      }
        return (
          <div className="ui page grid">
            <div className="row">
              <div className="column">
                <h1 className="ui header"><a target="_blank" href={'/export/NTriples/' + encodeURIComponent(currentComponent.props.UserStore.graphName)}><span className="ui big black circular label">{i}</span></a> Registered Users</h1>
                  <div className="ui segment">
                    <div className="ui huge divided animated list">
                      {list}
                    </div>
                    {emailHint ? <div>* A notification email will be sent to the user after activation.</div> : ''}
                  </div>
              </div>
            </div>
          </div>
        );
    }
}
UsersList.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};

UsersList = connectToStores(UsersList, [UserStore], function (context, props) {
    return {
        UserStore: context.getStore(UserStore).getState()
    };
});
export default UsersList;
