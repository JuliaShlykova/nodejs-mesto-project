import mongoose, { Schema } from 'mongoose';
import URL_REGEX from '../constants/regex';

export interface ICard {
  name: string;
  link: string;
  owner: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const cardSchema = new Schema<ICard>({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator(v: string) {
        return URL_REGEX.test(v);
      },
      message: 'Передан некорректный URL-адрес для карточки',
    },
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: {
    type: [{
      type: mongoose.Types.ObjectId,
      ref: 'user',
    }],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
}, {
  versionKey: false,
});

export default mongoose.model<ICard>('Card', cardSchema);
