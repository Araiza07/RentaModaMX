const moongoose = require ('mongoose');
const { mongodb } = require('./keys');

moongoose.connect(mongodb.URI, {useNewUrlParser:true})
    .then(db => console.log('BD conectada'))
    .catch(err => console.error(err));
