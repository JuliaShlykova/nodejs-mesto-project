import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

export interface IUser {
  name?: string;
  about?: string;
  avatar?: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minLength: 2,
    maxLength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minLength: 2,
    maxLength: 200,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
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
