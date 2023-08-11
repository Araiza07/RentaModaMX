const nodemailer = require('nodemailer');
const Recaptcha = require('google-recaptcha');
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const previousUrl = require("../middlewares/previousUrl");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const isLoggedIn=require("../middlewares/isLoggedIn")
const currentUrl = require("../middlewares/currentUrl");
const { check, validationResult } = require('express-validator');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"/uploads/users"));
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-')+ file.originalname);
  },
});

const upload = multer({ storage: storage });

const recaptcha = new Recaptcha({ secret: '6LcLr5slAAAAAMi5S06BGPrd9Rv7W' });


const validarActivo= async(req,res,next)=>{
  const {id} = req.params;
  await User.find(id, {verificado: false}, (error, result)=> {
    if (req.user.verificado == false) {
      req.logout();
    }
  })
}

//Correo 
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
  user: 'ventamodamx@gmail.com',
  pass: 'pwhiawqqtbiyfjrb'
  }
});

router.post("/register", upload.single("image"), [
 
    check('username')
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error('Este nombre de usuario ya está en uso');
      }
      
    }),


], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(req.body);
    const valores = req.body;
    const validaciones = errors.array();
   
return res.render('../views/authentication/register.ejs', { validaciones, valores });

  }
  

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    let oData = req.body;

    const userObj = new User({
      username: req.body.username,
      email: req.body.email,
      telefono: req.body.telefono,
      codePass: 0,
      codeNuevo: code,
      nombreCompleto: req.body.nombreCompleto
    });
    const resultUsername = await User.findOne({ username: userObj.username });
    if (resultUsername) {
      req.flash("register", "Este nombre de usuario ya está en uso");
      return res.redirect("/register");
    }

    let file;
    try {
      file = path.join(__dirname, "/uploads/users/" + req.file.filename);
      userObj.image = {
        data: fs.readFileSync(file),
        contentType: "image/png",
      };

    } catch (e) {
      userObj.image = null;
    }

    const mailOptions = {
      from: 'ventamodamx@gmail.com',
      to: userObj.email,
      subject: `Bienvenido a VentaModaMX - @${userObj.username}`,
      text: "Tienda número 1 tenerte a la moda",
      html: `
      <h1>Bienvenido a Venta Moda MX - Tu tienda de ropa favorita</h1>
      <h2>Te damos la bienvenida: ${userObj.nombreCompleto}</h2>
      <p>Tu código de inicio de sesión es: ${userObj.codeNuevo}</p>
      <p>Este código es importante para poder iniciar sesión por primera vez en la aplicación</p>
      <img src="https://media.istockphoto.com/id/1210584470/es/foto/tienda-de-ropa-para-hombre.jpg?s=612x612&w=0&k=20&c=Zyl9IGQGqUesoI-DzJorl2iiwrP-eKLqOsM6bXoAeG4=" alt="Imagen de Venta Moda MX">`
    };
    

    const result = await User.findOne({ email: userObj.email });
    if (result == undefined || result == null || result[0] == null) {
      if (req.body.password == req.body.pwd2) {
        const enviarEmail = transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email enviado: ' + info.response);
          }
        });

        User.register(userObj, req.body.password);
        enviarEmail;
        req.flash("login", "Usuario registrado correctamente, inicie sesión para continuar");
        req.flash("login", "Se ha enviado un email con su código de acceso para acceder");
        return res.redirect("/login");

      } else {
        req.flash("error", "Las contraseñas no coinciden");
        return res.redirect("/register");
      }
    } else {
      if (userObj.email == result.email) {
        req.flash("register", "Este correo ya existe");
        return res.redirect("/register");

      }
     
    }
 
  } catch (err) {
    console.log(err);
    req.flash("register", "El correo o usuario están duplicados, por favor elija otro");
    return res.redirect("/register");
  }
});



router.get('/autocomplete', function(req, res) {
  var rutas = [
    { label: 'Todos los prodcutos', value: '/productAll' },
    { label: 'Inicio', value: '/' },
    { label: 'Novedades', value: '/novedades' },
    { label: 'Categorias', value: '/categorias' },
  ];
  res.send(rutas);
});


router.get("/register", 
(req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      req.flash("error", "Ya está conectado");
      let redirect = "/";

      
      res.redirect(redirect);
    } else next();
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
}, async (req, res) => {
  try {
    res.render("authentication/register");
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});







router.get(
  "/login",
  (req, res, next) => {
    try {
      if (req.isAuthenticated()) {
        req.flash("error", "Ya está conectado");
        let redirect = "/";

        
        res.redirect(redirect);
      } else next();
    } catch (e) {
      console.log(e);
      res.status(404).render("error/error", { status: "404" });
    }
  },
  async (req, res) => {
    try {
      res.render("authentication/login");
    } catch (e) {
      res.status(404).render("error/error", { status: "404" });
    }
  }
);

router.get("/verificar",previousUrl, isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await User.findById(id);
    res.render("authentication/verificar", {data});
  } catch (err) { 
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
});

router.patch("/verificar/:id", async (req, res) => { //codeNuevo
  try {
    const { id } = req.params;
    const data = req.body.codeNuevo;

    if (data == req.user.codeNuevo) {
      await User.findByIdAndUpdate(id, {verificado: true});
      res.redirect("/");
    } else {
      console.log("Error")
      req.flash("error", "Codigo de verificacion incorrecto");
      res.redirect("/salir")
    }
  } catch (err) {
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
});

router.get("/salir", function (req, res) {
  try {
    req.flash("login", "Usuario desconectado");
    req.logout();
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    try {
      if (req.user.verificado == false) {
        req.flash("error", `Cuenta no verificada es nesesario que se valide la cuenta`);
        res.redirect('/verificar')

      } else {
        req.flash("login", `Bienvenido de nuevo "${req.user.username}" `);
        // req.session.requestedUrl ||
        let redirect = req.session.previousUrl || "/"; 
        res.redirect(redirect);
      }
    } catch (e) {
      console.log(e);
      res.status(404).render("error/error", { status: "404" });
    }
  }
);
router.get("/logout", function (req, res) {
  try {
    req.flash("login", "Usuario desconectado");
    req.logout();
    let redirect = req.session.previousUrl || "/";
    res.redirect(redirect);
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

//Google Authentication Routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    try {
      // Successful authentication, redirect home.
      // let redirect=req.session.requestedUrl || req.session.previousUrl|| '/';
      console.log("Introducido en la autenticación de google");
      let redirect = req.session.previousUrl || "/";
      res.redirect(redirect);
    } catch (e) {
      console.log(e);
      res.status(404).render("error/error", { status: "404" });
    }
  }
);


router.get("/rPass", 
(req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      req.flash("error", "Ya está conectado");
      let redirect = "/";

      
      res.redirect(redirect);
    } else next();
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
}, async (req, res) => {
  try {
    res.render("authentication/rContraceña");
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

router.post("/rPass", async (req, res) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const correo  = req.body.email;

    await User.find({email: correo}, async function (error, result) {
      if (result == undefined || result == null || result[0] == null) {
        req.flash("error", "El correo no esta registrado a LibritoMX")
        res.redirect('/login');
      }else{
      if (correo == result[0].email) {
        const mailOptions = {
            from: 'libritomxdev@gmail.com',
            to: result[0].email,
            subject: `Recuperar tu contraceña`,
            html: `
            <h1>Recuperar contraceña</h1>
            <p>Tu codigo de para recuperar contraceña es: ${code}</p>
            <p>Este codigo es importante para poder recuperar tu contraceña</p>
            <img src="https://familiasactivas.com/wp-content/uploads/2018/04/rafaelalberti.jpg" alt="Imagen de librito mx">`
          };
  
          const enviarEmail = transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email enviado: ' + info.response);
            }
      })
        const id = result[0]._id
        const p = await User.findByIdAndUpdate({_id: id}, {$set: {codePass: code}})
        console.log(p, enviarEmail);
        req.flash("success", "ya cuentas con tu codigo, dirijete a 'Tengo mi codigo de verificacion'")
        res.redirect("/rPass")
      }else{
        console.log(error)
        req.flash("error", "Error")
        res.redirect("/rPass")
      }
      if (error) {
        console.log(error)
        req.flash("error", "Error")
        res.redirect("/rPass")
      }
    }
    })
  // }
  } catch (err) { 
    console.log(err);
    res.flash("error", "Correo invalido");
    res.redirect("/rPass")
  }
});

router.post("/rPassUpdate", async (req, res)=>{
  try {



    const codigo = req.body.codePass;
    const correo = req.body.email;
    const pass = req.body.password;
    // if (!data.success) {
    //   req.flash("error", "reCAPTCHA invalido, Acaso no eres un humano!");
    //   res.redirect("/rPass");
    // }else{
    await User.find({email: correo}, async function (error, result) {
      if (result == undefined || result == null || result[0] == null) {
        req.flash("error","El correo no esta registrado a LibritoMX");
        res.redirect("/rPass")
      } else {
        console.log("Exito");
        if (correo == result[0].email) {
          console.log("El email existe");
          if (codigo == result[0].codePass) {
            console.log("El codigo es correcto");
              if (pass == req.body.pwd2) {
                const mailOptions = {
                  from: 'libritomxdev@gmail.com',
                  to: result[0].email,
                  subject: `Contraceña restablecida`,
                  html: `
                  <h1>Contraceña restableciada</h1>
                  <p>Has actualizado la contraceña</p>
                  <img src="https://familiasactivas.com/wp-content/uploads/2018/04/rafaelalberti.jpg" alt="Imagen de librito mx">`
                };

                const enviarEmail = transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email enviado: ' + info.response);
                  }
                });

                console.log("pass correcta");
                await result[0].setPassword(req.body.password);
                await result[0].save();
                enviarEmail;
                console.log(result)
                req.flash("success", "Todo es correcto");
                res.redirect("/login")
              }else{
                req.flash("error","Las contraceñas no coinciden");
                res.redirect("/rPass")
              };
            }else{
              req.flash("error","Codigo de verificacion incorrecto");
              res.redirect("/rPass")
            }
        } else {
          req.flash("error","Este correo no existe")
          res.redirect("/rPass")
        }
      };
    });
  
  // }
  } catch (error) {
      res.flash("error", "Error de sistema");
      res.redirect("/rPass")
  }
});




module.exports = router;
