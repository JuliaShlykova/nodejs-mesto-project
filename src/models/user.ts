import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

export interface IUser {
  name: string;
  about: string;
  avatar: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  about: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 200,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator(v: string) {
        return validator.isURL(v);
      },
      message: 'Передан некорректный URL-адрес для аватара',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator(v: string) {
        return validator.isEmail(v);
      },
      message: 'Передан некорректный адрес электронной почты',
    },
  },
  password: {
    type: String,
    required: true,
  },
}, {
  versionKey: false,
});

export default mongoose.model<IUser>('User', userSchema);
