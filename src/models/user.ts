import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import URL_REGEX from '../constants/regex';

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
        return URL_REGEX.test(v);
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
    select: false,
  },
}, {
  versionKey: false,
  // forbid sending password when res.send(user)
  toJSON: {
    transform: (doc, ret) => {
      const safeUser = { ...ret } as Partial<typeof ret>;
      delete safeUser.password;
      return safeUser;
    },
  },
});

export default mongoose.model<IUser>('User', userSchema);
