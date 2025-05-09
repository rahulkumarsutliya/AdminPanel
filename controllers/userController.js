const User = require('../models/Users');
const bcrypt = require('bcryptjs');


// GET /users — List users
exports.getUsers = async (req, resp) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    resp.status(200).send({ total, page: Number(page), users });
  } catch (error) {
    resp.status(500).send({ message: 'Error fetching users', error: error.message });
  }
};


//GET /users/:id -- get user by id
exports.getUser = async(req,resp)=>{
    const { id } = req.params;

    try{
        const user = await User.findById(id);
        if(!user){
            return resp.status(404).send({message: "User Not Found"})
        }
        resp.status(200).send({user});
    }catch(error){
        resp.status(500).send({message: "Error fetching user",error:error.message});
    }
};


// POST /users — Add a new user (admin only)
exports.addUser = async (req, resp) => {
  const { name, email, password } = req.body;

  try {
    
    if(!name || !email || !password){
      return resp.status(400).send({message: "Fields cannot be empty"});
    }

    const existingUser = await User.findOne({ email });
    if(existingUser) return resp.status(400).send({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: true, 
    });

    await newUser.save();
    resp.status(201).send({ message: 'User created successfully', user: newUser });

  } catch (error) {
    resp.status(500).send({ message: 'Error creating user', error: error.message });
  }
};

// PUT /users/:id — Update user
exports.updateUser = async (req, resp) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {

    if(!name && !email && !role){
      return resp.status(400).send({message: "Fields cannot be empty"});
    }

    const user = await User.findByIdAndUpdate(
      id,
      { name, email ,role},
      { new: true }
    );

    if (!user) return resp.status(404).send({ message: 'User not found' });

    resp.status(200).send({ message: 'User updated', user });
  } catch (error) {
    resp.status(500).send({ message: 'Error updating user', error: error.message });
  }
};

// DELETE /users/:id — Delete user
exports.deleteUser = async (req, resp) => {
  const { id } = req.params;

  try {

    const user = await User.findByIdAndDelete(id);
    if (!user) return resp.status(404).send({ message: 'User not found' });

    resp.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    resp.status(500).send({ message: 'Error deleting user', error: error.message });
  }
};
