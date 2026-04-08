import { Star, Heart, Lightbulb, Users, Clock, Zap } from 'lucide-react';
import { Skill } from './types';

export const SKILLS: Skill[] = [
  { id: 'p1', name: '+1 分', icon: 'Star', points: 1 },
  { id: 'p2', name: '+2 分', icon: 'Star', points: 2 },
  { id: 'p3', name: '+3 分', icon: 'Star', points: 3 },
  { id: 'p4', name: '+4 分', icon: 'Star', points: 4 },
  { id: 'p5', name: '+5 分', icon: 'Star', points: 5 },
  { id: '1', name: '幫助他人', icon: 'Heart', points: 1 },
  { id: '2', name: '專注學習', icon: 'Clock', points: 1 },
  { id: '5', name: '團隊合作', icon: 'Users', points: 1 },
];

export const NEEDS_WORK_SKILLS: Skill[] = [
  { id: 'm1', name: '-1 分', icon: 'Zap', points: -1 },
  { id: 'm2', name: '-2 分', icon: 'Zap', points: -2 },
  { id: 'm3', name: '-3 分', icon: 'Zap', points: -3 },
  { id: 'm4', name: '-4 分', icon: 'Zap', points: -4 },
  { id: 'm5', name: '-5 分', icon: 'Zap', points: -5 },
  { id: 'n1', name: '分心', icon: 'Clock', points: -1 },
  { id: 'n2', name: '不尊重他人', icon: 'Zap', points: -1 },
];

export const INITIAL_STUDENTS = [];
