# PeptideTech Research - Peptide E-commerce Platform

A professional e-commerce platform for research peptides built with React, TypeScript, and Supabase.

## Features

- **Product Catalog**: Comprehensive peptide database with detailed specifications
- **Advanced Search & Filtering**: Filter by purity, molecular weight, price, applications
- **User Authentication**: Secure registration and login for researchers
- **Shopping Cart**: Full cart management with checkout process
- **Order Management**: Complete order tracking and history
- **Research Compliance**: Built-in disclaimers and research-only purchasing
- **Cold Chain Shipping**: Temperature-controlled shipping options
- **Professional UI**: Clean, research-focused design

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd peptidetech-research
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update the `.env` file with your credentials

4. Run database migrations
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration files in order:
     - `supabase/migrations/create_user_profiles.sql`
     - `supabase/migrations/create_orders.sql`
     - `supabase/migrations/create_shipping_addresses.sql`
     - `supabase/migrations/create_product_reviews.sql`
     - `supabase/migrations/create_research_applications.sql`

5. Start the development server
```bash
npm run dev
```

## Database Schema

### Core Tables

- **user_profiles**: Extended user information beyond auth
- **orders**: Order management with status tracking
- **order_items**: Individual items within orders
- **shipping_addresses**: User shipping address management
- **product_reviews**: Product reviews and ratings
- **research_applications**: Research compliance tracking

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic user profile creation on signup
- Secure order and review management

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/          # React components
├── contexts/           # React contexts (Auth, Cart)
├── data/              # Static data (products, categories)
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## Key Components

- **ProductGrid**: Main product catalog with filtering
- **ProductDetailPage**: Detailed product information
- **CartSidebar**: Shopping cart management
- **CheckoutPage**: Multi-step checkout process
- **AuthModal**: User authentication
- **AdvancedFilters**: Product filtering system

## Features in Detail

### Product Management
- Detailed product specifications
- Multiple variants (sizes/prices)
- Stock management
- Certificate of Analysis (COA)
- Storage and usage guidelines

### User Experience
- Professional research-focused design
- Mobile-responsive interface
- Real-time cart updates
- Advanced search and filtering
- Order history and tracking

### Compliance
- Research-only disclaimers
- Institution/company requirements
- Ethics approval tracking
- Safety protocol documentation

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in `src/components/`
2. Add types to `src/types/index.ts`
3. Update database schema if needed
4. Add custom hooks for data management

## Deployment

1. Build the project
```bash
npm run build
```

2. Deploy to your preferred hosting platform
3. Set up environment variables in production
4. Configure Supabase for production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.