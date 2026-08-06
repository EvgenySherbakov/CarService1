import { mockRentalCars } from './mock-data';
import type { CompanyInfo } from '@/types';

/**
 * Public company profile used on the guest-facing pages
 * (Contacts / Fleet / About). Edit content here.
 */
export const companyInfo: CompanyInfo = {
  name: 'AutoDuck',
  legalName: 'AutoDuck Serviços Automotivos LTDA',
  foundedYear: 2014,
  phones: ['+55 11 4002-8922', '+55 11 99999-0000'],
  whatsapp: '5511999990000',
  email: 'contato@autoduck.com.br',
  address: 'Av. Paulista, 1000 — Bela Vista, São Paulo - SP, 01310-100',
  mapQuery: 'Av. Paulista 1000, São Paulo',
  mapImageUrl:
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200',
  heroImageUrl:
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=1400',
  gallery: [
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=900',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900',
    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=900',
    'https://images.unsplash.com/photo-1605618826115-fb9e0cabd9c4?w=900',
    'https://images.unsplash.com/photo-1632823469850-2f77dd1eea7c?w=900',
    'https://images.unsplash.com/photo-1599256621730-535171e28e50?w=900',
  ],
  team: [
    {
      id: 't1',
      name: 'Ricardo Almeida',
      roleKey: 'about.roleFounder',
      photoUrl: 'https://i.pravatar.cc/300?img=11',
    },
    {
      id: 't2',
      name: 'Beatriz Costa',
      roleKey: 'about.roleCoFounder',
      photoUrl: 'https://i.pravatar.cc/300?img=45',
    },
    {
      id: 't3',
      name: 'Marcos Oliveira',
      roleKey: 'about.roleDirector',
      photoUrl: 'https://i.pravatar.cc/300?img=33',
    },
    {
      id: 't4',
      name: 'João Pereira',
      roleKey: 'about.roleLeadMechanic',
      photoUrl: 'https://i.pravatar.cc/300?img=68',
    },
  ],
  stats: {
    years: new Date().getFullYear() - 2014,
    clients: 15000,
    cars: mockRentalCars.length,
    rating: 4.8,
  },
};
