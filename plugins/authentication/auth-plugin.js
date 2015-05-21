'use strict';

module.exports = function authPlugin(options) {
    /**
     * @class authPlugin
     */
    return {
        name: 'AuthPlugin',
        // Called after context creation to dynamically create a context plugin
        plugContext: function plugContext(contextOptions) {
            // `options` is the same as what is passed into `Fluxible.createContext(options)`
            var user=null;
            if(contextOptions.req){
              user=contextOptions.req.user;
            }
            // Returns a context plugin
            return {
                /**
                 * Provides full access to the user in the action context
                 * @param {Object} actionContext
                 */
                plugActionContext: function plugActionContext(actionContext) {
                    actionContext.getUser = function() { return user;} ;
                },
                /**
                 * Provides access to user
                 * @param {Object} componentContext
                 */
                plugComponentContext: function plugComponentContext(componentContext) {
                    componentContext.getUser = function() { return user;} ;
                },
                /**
                 * Provides access to user
                 * @param {Object} storeContext
                 */
                plugStoreContext: function plugStoreContext(storeContext) {
                    storeContext.getUser = function() { return user;} ;
                },
                dehydrate: function () {
                      return {
                          user: user
                      };
                },
                // Called on client to rehydrate the context plugin settings
                rehydrate: function (state) {
                      user = state.user;
                }
            };
        },

    };
};
