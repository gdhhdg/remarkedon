module.exports = {
    'facebookAuth': {
        'clientID':'509338236192362',
        'clientSecret':'154dd6bd269d74814473964281b9a27b',
        'callbackURL':'http://remarkedon.com/auth/facebook/callback',
        'profileURL':'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFileds':['id', 'email', 'name'],
    },
    //
    // 'twitterAuth': {
    //     'consumerKey':'I8QDjiPYzCpQ5aStM2Nn2bau2',
    //     'consumerSecret':'4r7QpgAfHHgbdTzQiaareNqdCOYbD1yhKISQJe7dXFUwjuII8N',
    //     'callbackURL':'http://127.0.0.1::3333/auth/twitter/callback'
    // },

    'googleAuth': {
        'clientID':'580958783958-vnbf80nca3kj0gvjjot3ojtaronc38qf.apps.googleusercontent.com',
        'clientSecret':'IayzMV5UerDRu22MXty3Zyxu',
        'callbackURL':'http://remarkedon.com/auth/google/callback'
    },
    'reCaptcha':{
        'secretKey':'6LfxlpkUAAAAABT0Riop12E7ZyYlVcF_F03J6VGt'
    }

};
