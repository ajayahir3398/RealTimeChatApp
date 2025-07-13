const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profilePic: {
    type: String,
    default: 'https://via.placeholder.com/150x150?text=User'
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  }
}, {
  timestamps: true
});

userSchema.index({ mobile: 1 });
userSchema.index({ status: 1 });

userSchema.virtual('isOnline').get(function() {
  return this.status === 'online';
});

userSchema.methods.checkPassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    mobile: this.mobile,
    profilePic: this.profilePic,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 