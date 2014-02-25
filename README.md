## alamid-schema

[![Build Status](https://secure.travis-ci.org/peerigon/alamid-schema.png?branch=master)](https://travis-ci.org/peerigon/alamid-schema)
[![Dependency Status](https://david-dm.org/peerigon/alamid-schema/status.png)](https://david-dm.org/peerigon/alamid-schema)


```javascript
var Schema = require("alamid-schema");

var Panda = new Schema("Panda", {
    name: "poly",
    age: {
        type: Number,
        required: true
    },
    mood: {
        type: String,
        enum: ["grumpy", "happy"]
    },
    birthday: Date
});
```

## Plugins

### Validation

__Example__

```

var panda = {
    name: "peeri",
    age: 3,
    mood: "happy",
    birthday: Date.now()
};

Panda.validate(panda, function(validation) {

    if(validation.result) {
         //happy panda
    }
    else {
        //sad panda
    }

});
```