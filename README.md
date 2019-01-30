lookup-oauth-js
===============

Customized version of [OAuth.io](https://oauth.io) [JavaScript SDK](https://github.com/oauth-io/oauth-js). 

### Customization changes
- custom server url (https://lookup-signin.herokuapp.com) in Grunfile.js envify section

The last change is done in pretty clumsy way (will be appreciate for more elegant hint): in core.coffee getJquery is modified to return global jQuery variable - so it works in assumption, that global jQuery is available. 

If you are using [RequireJS](http://requirejs.org/) config can look like:

```javascript
{
    shim: {
        'jquery': {
            exports: 'jQuery'
        },
        'oauth-js': {
            deps: ['jquery'],
            exports: 'OAuth'
        }
    },
    paths: {
        'jquery': 'libs/jquery/dist/jquery',
        'oauth-js': 'libs/lookup-oauth-js/dist/oauth'
    }
}
 ```
 
...and futher using like:

```javascript
define(['oauth-js'], function (OAuth) {
    OAuth.initialize(YOUR_OAUTHD_KEY);
    OAuth.popup(PROVIDER_NAME).done(function (result) {
        console.log('result: %o', result);
        result.me().done(function (data) {
            console.log('data: %o', data);
            alert('Hello ' + data.name + '!');
        }).fail(function (err) {
            console.log(err);
        });
    }).fail(function (err) {
        console.log(err);
    });
});
 ```

### Versions

2015-08-13: initital 0.4.3 version 
2015-08-13: 0.4.4 version: removing [Q]() dependency; dist file size decreased (uncompressed: 115 kB -> 52 kB)

 
### License

This SDK is published under the Apache2 License.

More information in [oauth.io documentation](http://oauth.io/#/docs)
