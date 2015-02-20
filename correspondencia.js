var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    errorHandler = require('errorhandler'),
    mongoose = require('mongoose');
 
var app = express();


// conexión--------------------------------

//var conCorrespondencia = mongoose.createConnection('mongodb://172.20.0.223/correspondencia');
var conexion = mongoose.createConnection('mongodb://172.20.0.223/');
var conCorrespondencia = conexion.useDb('correspondencia');
var conConstancias = conexion.useDb('constancias');
//var conConstancias = mongoose.createConnection('mongodb://localhost/constancias');
 
//mongoose.connect('mongodb://172.20.0.223/correspondencia');
 
// config-----------------------------------
 
//app.use(express.bodyParser());
app.use(methodOverride());
app.use(session({ resave: true, saveUninitialized: true,secret: 'uwotm8' }));
//app.use(app.router);
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

// parse application/json
app.use(bodyParser.json({limit: '10mb'}));                        
//app.use(bodyParser({limit: '5mb'}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse multipart/form-data
app.use(multer());

app.use(express.static(path.join(application_root, "public")));


//función para autenticación básica--------------------------------

app.use(function(req, res, next) {
    var auth;

    // check whether an autorization header was send    
    if (req.headers.authorization) {
      // only accepting basic auth, so:
      // * cut the starting "Basic " from the header
      // * decode the base64 encoded username:password
      // * split the string at the colon
      // -> should result in an array
      auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
    }

    // checks if:
    // * auth array exists 
    // * first value matches the expected user 
    // * second value the expected password
    if (!auth || auth[0] !== 'sistemas' || auth[1] !== 'sistemas2015') {
        // any of the tests failed
        // send an Basic Auth request (HTTP Code: 401 Unauthorized)
        res.statusCode = 401;
        // MyRealmName can be changed to anything, will be prompted to the user
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        // this will displayed in the browser when authorization is cancelled
        res.end('Unauthorized');
    } else {
        // continue with processing, user was authenticated
        next();
    }
});


//----------------------------------------------------------------


var Schema = mongoose.Schema; //Schema.ObjectId
 
// Schemas___________________________________________________________________________
 
var Sizes = new Schema({
    size: { type: String, required: true },
    available: { type: Number, required: false, min: 0, max: 1000 },
    sku: { 
        type: String, 
        required: false, 
        validate: [/[a-zA-Z0-9]/, 'Product sku should only have letters and numbers']
    },
    price: { type: Number, required: true, min: 0 }
});
 
 
// Schema global para documentos de mongo
 
var documento = new Schema({
    //description: { type: String, required: true },
    clave: { type: String, required: true },
    imagen_docto: { type: String },
    num_pagina: { type: Number },
    tipo_docto: { type: String },
    subtipo_docto: { type: String },
    tipo_archivo: { type: String },
    status_docto: { type: Number, required: true, default: 1 },
    metadatos: { type: String },
    shardkey: { type: String },
    datos_ocultos: { type: String },
    fecha_insercion: { type: Date, default: Date.now }

});
 


documento.statics.nuevapagina = function(clavedoc, doc){
  this.findOne({ clave : clavedoc }).sort(num_pagina, 1).run( function(err, doc) {
     var max = doc.num_pagina + 1;
}





// validation
 
// Product.path('title').validate(function (v) {
//     console.log("validate title");
//     console.log(v);
//     return v.length > 1 && v.length < 70;
// });


// Product.path('description').validate(function (v) {
//     console.log("validate description");
//     console.log(v);
//     return v.length > 10;
// }, 'Product description should be more than 10 characters');
 
var ProductModel = mongoose.model('documento', documento);
var modeloCorrespondencia = conCorrespondencia.model('documento', documento, 'documentos');
var modeloConstancias = conConstancias.model('documento', documento,'antecedentes');

/* Product Document 

*/
 
/* funcion ya no usada para autenticación básica
 function checkAuth(req, res, next) {
    if (!req.session.user_id) {
       res.send('No estás autorizado para ver esto');
       console.log("no esta autorizado");
    } else {
      console.log("esta autorizado");
     next();
    }
}
*/

// REST api__________________________________________________________________________________
 
app.get('/api', function (req, res) {
  res.send('API de Mongo funcionando :)');
});
 
// POST to CREATE
app.post('/api/documentos', function (req, res) {
  var documento;
  console.log("POST: ");
  console.log(req.body);
  documento = new modeloCorrespondencia({
    clave: req.body.clave,
    imagen_docto: req.body.imagen_docto,
    num_pagina: req.body.num_pagina,
    tipo_docto: req.body.tipo_docto,
    subtipo_docto: req.body.subtipo_docto,
    tipo_archivo: req.body.tipo_archivo,
    metadatos: req.body.metadatos,
    shardkey: req.body.shardkey,
    datos_ocultos: req.body.datos_ocultos    
  });
  documento.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      return console.log(err);
    }
  });
  return res.send(documento);
});

app.post('/api/constancias', function (req, res) {
  var documento;
  console.log("POST: ");
  console.log(req.body);
  documento = new modeloConstancias({
    clave: req.body.clave,
    imagen_docto: req.body.imagen_docto,
    num_pagina: req.body.num_pagina,
    tipo_docto: req.body.tipo_docto,
    subtipo_docto: req.body.subtipo_docto,
    tipo_archivo: req.body.tipo_archivo,
    metadatos: req.body.metadatos,
    shardkey: req.body.shardkey,
    datos_ocultos: req.body.datos_ocultos    
  });
  documento.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      return console.log(err);
    }
  });
  return res.send(documento);
});

app.post('/login', function (req, res) {
var post = req.body;
    if (post.user === '$1stemas' && post.password === 'sist2015') {
      req.session.user_id = 1;
      console.log("autenticado correctamente");
      res.redirect('/api');
    } else {
        res.send('Bad user/pass');
  }
}); 

app.get('/logout', function (req, res) {
   delete req.session.user_id;
   res.redirect('/login');
});      
//------------------------------------------------------------
// PUT to UPDATE
 
// Bulk update
app.put('/api/products', function (req, res) {
    var i, len = 0;
    console.log("is Array req.body.products");
    console.log(Array.isArray(req.body.products));
    console.log("PUT: (products)");
    console.log(req.body.products);
    if (Array.isArray(req.body.products)) {
        len = req.body.products.length;
    }
    for (i = 0; i < len; i++) {
        console.log("UPDATE product by id:");
        for (var id in req.body.products[i]) {
            console.log(id);
        }
        ProductModel.update({ "_id": id }, req.body.products[i][id], function (err, numAffected) {
            if (err) {
                console.log("Error on update");
                console.log(err);
            } else {
                console.log("updated num: " + numAffected);
            }
        });
    }
    return res.send(req.body.products);
});
 
// Single update
app.put('/api/products/:id', function (req, res) {
  return ProductModel.findById(req.params.id, function (err, product) {
    product.title = req.body.title;
    product.description = req.body.description;
  return product.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.send(product);
    });
  });
});
 
// Funciones get
 
// List products
app.get('/api/products', function (req, res) {
  return ProductModel.find(function (err, documento) {
    if (!err) {
      return res.send(products);
    } else {
      return console.log(err);
    }
  });
});
 
// Single product
app.get('/api/documentos/:id', function (req, res) {
  //return ProductModel.findById(req.params.id, function (err, documento) {
  return modeloCorrespondencia.findById(req.params.id, function (err, documento) {  
    if (!err) {
      return res.send(documento);
    } else {
      return console.log(err);
    }
  });
});

app.get('/api/constancias/:id', function (req, res) {
  return modeloConstancias.findById(req.params.id, function (err, documento) {  
    if (!err) {
      return res.send(documento);
    } else {
      return console.log(err);
    }
  });
});

//conjunto de documentos por campo clave
app.get('/api/documentos/porclave/:clave', function (req, res) {
  return ProductModel.find({ clave: req.params.clave }, function (err, documento) {
    if (!err) {
      return res.send(documento);
    } else {
      return console.log(err);
    }
  });
});


app.get('/api/documentos/imagen/:id', function (req, res) {
  return modeloCorrespondencia.findById(req.params.id, function (err, documento) {
    if (!err) {
      return res.send(documento.imagen_docto);
    } else {
      return console.log(err);
    }
  });
});
 
// DELETE to DESTROY
 
// Bulk destroy all products
app.delete('/api/products', function (req, res) {
  ProductModel.remove(function (err) {
    if (!err) {
      console.log("removed");
      return res.send('');
    } else {
      console.log(err);
    }
  });
});
 
// remove a single product
app.delete('/api/products/:id', function (req, res) {
  return ProductModel.findById(req.params.id, function (err, product) {
    return product.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
});
 
// launch server
 
app.listen(4242);