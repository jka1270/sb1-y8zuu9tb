import { Product, Category } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'Therapeutic Peptides', description: 'Bioactive peptides for therapeutic research', productCount: 11 },
  { id: '2', name: 'Cosmetic Peptides', description: 'Anti-aging and skin care peptides', productCount: 1 },
  { id: '3', name: 'Research Peptides', description: 'Novel peptides for scientific studies', productCount: 11 },
  { id: '4', name: 'Custom Synthesis', description: 'Custom peptide synthesis services', productCount: 0 },
  { id: '5', name: 'Peptide Libraries', description: 'Comprehensive peptide screening libraries', productCount: 0 },
];

export const nadProduct: Product = {
  id: '21',
  name: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
  category: 'Research Peptides',
  description: 'Essential coenzyme involved in cellular energy metabolism, DNA repair, and anti-aging research applications.',
  price: 64.99,
  image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=600',
  specifications: {
    'Molecular Formula': 'C21H27N7O14P2',
    'Storage': '-20°C, lyophilized',
    'Solubility': 'Water, saline solution',
    'Research Use': 'Cellular metabolism and anti-aging studies'
  },
  inStock: true,
  sku: 'NAD-500MG',
  purity: '≥98%',
  molecularWeight: '663.43 Da',
  sequence: 'Nicotinamide adenine dinucleotide',
  variants: [
    {
      id: 'nad-500mg',
      size: '500mg',
      price: 64.99,
      sku: 'NAD-500MG',
      inStock: true
    },
    {
      id: 'nad-1000mg',
      size: '1000mg',
      price: 124.99,
      sku: 'NAD-1000MG',
      inStock: true
    }
  ]
};

export const products: Product[] = [
  {
    id: '1',
    name: 'BPC-157 (Body Protection Compound)',
    category: 'Therapeutic Peptides',
    description: 'Pentadecapeptide with potent healing properties, extensively studied for tissue repair and regeneration. For Research Only - Not for human consumption.',
    price: 89.99,
    image: 'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C62H98N16O22',
      'Storage': '-20°C, dry conditions',
      'Solubility': 'Water soluble',
      'Research Use': 'Tissue repair studies'
    },
    inStock: true,
    sku: 'BPC-157-5MG',
    purity: '≥98%',
    molecularWeight: '1419.53 Da',
    sequence: 'GEPPPGKPADDAGLV',
    variants: [
      {
        id: 'bpc-5mg',
        size: '5mg',
        price: 24.99,
        sku: 'BPC-157-5MG',
        inStock: true
      },
      {
        id: 'bpc-10mg',
        size: '10mg',
        price: 35.99,
        sku: 'BPC-157-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '8',
    name: 'CJC-1295',
    category: 'Research Peptides',
    description: 'Long-acting growth hormone releasing hormone analog for research applications. For Research Only - Not for human consumption.',
    price: 89.99,
    image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C152H252N44O42',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Bacteriostatic water',
      'Research Use': 'Growth hormone studies'
    },
    inStock: true,
    sku: 'CJC-10MG',
    purity: '≥98%',
    molecularWeight: '3367.97 Da',
    sequence: 'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-Lys(Maleimidopropionyl)-NH2',
    variants: [
      {
        id: 'cjc-10mg',
        size: '10mg',
        price: 89.99,
        sku: 'CJC-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '11',
    name: 'CJC-1295 DAC',
    category: 'Therapeutic Peptides',
    description: 'Long-acting growth hormone releasing hormone analog with Drug Affinity Complex for extended half-life and sustained release.',
    price: 79.99,
    image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C152H252N44O42',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Bacteriostatic water',
      'Research Use': 'Growth hormone studies'
    },
    inStock: true,
    sku: 'CJC-DAC-2MG',
    purity: '≥98%',
    molecularWeight: '3367.97 Da',
    sequence: 'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-Lys(Maleimidopropionyl)-NH2',
    variants: [
      {
        id: 'cjc-dac-2mg',
        size: '2mg',
        price: 79.99,
        sku: 'CJC-DAC-2MG',
        inStock: true
      },
      {
        id: 'cjc-dac-5mg',
        size: '5mg',
        price: 149.99,
        sku: 'CJC-DAC-5MG',
        inStock: true
      }
    ]
  },
  {
    id: '12',
    name: 'CJC-1295 (5mg) / Ipamorelin (5mg)',
    category: 'Research Peptides',
    description: 'Synergistic combination of CJC-1295 and Ipamorelin for enhanced growth hormone research applications. For Research Only - Not for human consumption.',
    price: 74.99,
    image: 'https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Combination': 'CJC-1295 5mg + Ipamorelin 5mg',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Bacteriostatic water',
      'Research Use': 'Synergistic growth hormone studies'
    },
    inStock: true,
    sku: 'CJC-IPA-10MG',
    purity: '≥98% each peptide',
    molecularWeight: '4079.82 Da (combined)',
    sequence: 'CJC-1295 + Ipamorelin combination',
    variants: [
      {
        id: 'cjc-ipa-10mg',
        size: '10mg',
        price: 74.99,
        sku: 'CJC-IPA-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '6',
    name: 'GHK-CU',
    category: 'Cosmetic Peptides',
    description: 'Copper-binding peptide with wound healing and anti-aging properties. For Research Only - Not for human consumption.',
    price: 42.99,
    image: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C14H24CuN6O4',
      'Storage': '2-8°C, protected from light',
      'Solubility': 'Water soluble',
      'Research Use': 'Skin regeneration studies'
    },
    inStock: true,
    sku: 'GHK-CU-50MG',
    purity: '≥95%',
    molecularWeight: '404.93 Da',
    sequence: 'Gly-His-Lys',
    variants: [
      {
        id: 'ghk-50mg',
        size: '50mg',
        price: 42.99,
        sku: 'GHK-CU-50MG',
        inStock: true
      },
      {
        id: 'ghk-75mg',
        size: '75mg',
        price: 54.99,
        sku: 'GHK-CU-75MG',
        inStock: true
      },
      {
        id: 'ghk-100mg',
        size: '100mg',
        price: 69.99,
        sku: 'GHK-CU-100MG',
        inStock: true
      }
    ]
  },
  {
    id: '5',
    name: 'Ipamorelin',
    category: 'Research Peptides',
    description: 'Growth hormone releasing peptide with selective ghrelin receptor activity.',
    price: 59.99,
    image: 'https://images.pexels.com/photos/3735780/pexels-photo-3735780.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C38H49N9O5',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, saline solution',
      'Research Use': 'Growth hormone studies'
    },
    inStock: true,
    sku: 'IPA-5MG',
    purity: '≥98%',
    molecularWeight: '711.85 Da',
    sequence: 'Aib-His-D-2-Nal-D-Phe-Lys-NH2',
    variants: [
      {
        id: 'ipa-5mg',
        size: '5mg',
        price: 59.99,
        sku: 'IPA-5MG',
        inStock: true
      },
      {
        id: 'ipa-10mg',
        size: '10mg',
        price: 75.99,
        sku: 'IPA-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '4',
    name: 'Melanotan II',
    category: 'Research Peptides',
    description: 'Synthetic analog of melanocyte-stimulating hormone for pigmentation research.',
    price: 38.99,
    image: 'https://images.pexels.com/photos/3735780/pexels-photo-3735780.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C50H69N15O9',
      'Storage': '-20°C, dark conditions',
      'Solubility': 'Water, bacteriostatic water',
      'Research Use': 'Melanogenesis studies'
    },
    inStock: true,
    sku: 'MT2-10MG',
    purity: '≥99%',
    molecularWeight: '1024.18 Da',
    sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2',
    variants: [
      {
        id: 'mt2-10mg',
        size: '10mg',
        price: 38.99,
        sku: 'MT2-10MG',
        inStock: true
      },
    ]
  },
  {
    id: '7',
    name: 'PE-22-28',
    category: 'Research Peptides',
    description: 'Synthetic peptide with potential cognitive enhancement and neuroprotective properties for research applications.',
    price: 74.99,
    image: 'https://images.pexels.com/photos/3786164/pexels-photo-3786164.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C158H251N39O42',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, bacteriostatic water',
      'Research Use': 'Cognitive enhancement studies'
    },
    inStock: true,
    sku: 'PE22-10MG',
    purity: '≥98%',
    molecularWeight: '3357.02 Da',
    sequence: 'Research peptide sequence',
    variants: [
      {
        id: 'pe22-10mg',
        size: '10mg',
        price: 74.99,
        sku: 'PE22-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '8',
    name: 'PT-141',
    category: 'Research Peptides',
    description: 'Melanocortin receptor agonist peptide for sexual dysfunction and libido research applications.',
    price: 56.99,
    image: 'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C50H68N14O10',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, bacteriostatic water',
      'Research Use': 'Sexual dysfunction studies'
    },
    inStock: true,
    sku: 'PT141-5MG',
    purity: '≥98%',
    molecularWeight: '1025.18 Da',
    sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2',
    variants: [
      {
        id: 'pt141-5mg',
        size: '5mg',
        price: 56.99,
        sku: 'PT141-5MG',
        inStock: true
      },
      {
        id: 'pt141-10mg',
        size: '10mg',
        price: 64.99,
        sku: 'PT141-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '9',
    name: 'Retatrutide',
    category: 'Therapeutic Peptides',
    description: 'Triple agonist peptide targeting GLP-1, GIP, and glucagon receptors for advanced metabolic research.',
    price: 249.99,
    image: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C223H366N58O68S',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Sterile water, bacteriostatic water',
      'Research Use': 'Metabolic and obesity studies'
    },
    inStock: true,
    sku: 'RET-24MG',
    purity: '≥98%',
    molecularWeight: '5055.68 Da',
    sequence: 'Triple receptor agonist peptide',
    variants: [
      {
        id: 'ret-24mg',
        size: '24mg',
        price: 249.99,
        sku: 'RET-24MG',
        inStock: true
      },
      {
        id: 'ret-60mg',
        size: '60mg',
        price: 595.99,
        sku: 'RET-60MG',
        inStock: true
      }
    ]
  },
  {
    id: '10',
    name: 'Selank',
    category: 'Research Peptides',
    description: 'Synthetic heptapeptide with anxiolytic and nootropic properties for neurological research applications.',
    price: 49.99,
    image: 'https://images.pexels.com/photos/7723564/pexels-photo-7723564.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C33H57N11O9',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, saline solution',
      'Research Use': 'Anxiety and cognitive studies'
    },
    inStock: true,
    sku: 'SEL-5MG',
    purity: '≥98%',
    molecularWeight: '751.87 Da',
    sequence: 'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
    variants: [
      {
        id: 'sel-5mg',
        size: '5mg',
        price: 49.99,
        sku: 'SEL-5MG',
        inStock: true
      },
      {
        id: 'sel-10mg',
        size: '10mg',
        price: 54.99,
        sku: 'SEL-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '11',
    name: 'Semaglutide',
    category: 'Therapeutic Peptides',
    description: 'GLP-1 receptor agonist peptide for metabolic research and diabetes studies.',
    price: 89.99,
    image: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C187H291N45O59',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Sterile water, bacteriostatic water',
      'Research Use': 'Metabolic and diabetes studies'
    },
    inStock: true,
    sku: 'SEMA-5MG',
    purity: '≥98%',
    molecularWeight: '4113.58 Da',
    sequence: 'His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly',
    variants: [
      {
        id: 'sema-5mg',
        size: '5mg',
        price: 89.99,
        sku: 'SEMA-5MG',
        inStock: true
      },
      {
        id: 'sema-30mg',
        size: '30mg',
        price: 299.99,
        sku: 'SEMA-30MG',
        inStock: true
      }
    ]
  },
  {
    id: '12',
    name: 'Semax',
    category: 'Research Peptides',
    description: 'Synthetic heptapeptide analog of ACTH(4-10) with neuroprotective and cognitive enhancement properties for research applications.',
    price: 129.99,
    image: 'https://images.pexels.com/photos/3786164/pexels-photo-3786164.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C37H51N9O10S',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, saline solution',
      'Research Use': 'Neuroprotection and cognitive studies'
    },
    inStock: true,
    sku: 'SEMAX-30MG',
    purity: '≥98%',
    molecularWeight: '813.93 Da',
    sequence: 'Met-Glu-His-Phe-Pro-Gly-Pro',
    variants: [
      {
        id: 'semax-30mg',
        size: '30mg',
        price: 129.99,
        sku: 'SEMAX-30MG',
        inStock: true
      }
    ]
  },
  {
    id: '13',
    name: 'Sermorelin',
    category: 'Therapeutic Peptides',
    description: 'Growth hormone releasing hormone fragment for endocrine research.',
    price: 139.99,
    image: 'https://images.pexels.com/photos/3786164/pexels-photo-3786164.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C149H246N44O42S',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Sterile water',
      'Research Use': 'Growth hormone studies'
    },
    inStock: true,
    sku: 'SER-5MG',
    purity: '≥98%',
    molecularWeight: '3357.96 Da',
    sequence: 'Tyr-Ala-Asp-Ala-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg-NH2',
    variants: [
      {
        id: 'ser-5mg',
        size: '5mg',
        price: 139.99,
        sku: 'SER-5MG',
        inStock: true
      },
      {
        id: 'ser-10mg',
        size: '10mg',
        price: 169.99,
        sku: 'SER-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '14',
    name: 'SS-31',
    category: 'Research Peptides',
    description: 'Mitochondria-targeting peptide with cardioprotective and neuroprotective properties for cellular energy research.',
    price: 49.99,
    image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C42H78N16O14',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, saline solution',
      'Research Use': 'Mitochondrial function studies'
    },
    inStock: true,
    sku: 'SS31-10MG',
    purity: '≥98%',
    molecularWeight: '1047.18 Da',
    sequence: 'D-Arg-Dmt-Lys-Phe-NH2',
    variants: [
      {
        id: 'ss31-10mg',
        size: '10mg',
        price: 49.99,
        sku: 'SS31-10MG',
        inStock: true
      },
      {
        id: 'ss31-50mg',
        size: '50mg',
        price: 159.99,
        sku: 'SS31-50MG',
        inStock: true
      }
    ]
  },
  {
    id: '15',
    name: 'Survodutide',
    category: 'Therapeutic Peptides',
    description: 'Dual GLP-1/glucagon receptor agonist peptide for advanced metabolic research and obesity studies.',
    price: 139.99,
    image: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C233H348N60O68S2',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Sterile water, bacteriostatic water',
      'Research Use': 'Metabolic and obesity studies'
    },
    inStock: true,
    sku: 'SUR-10MG',
    purity: '≥98%',
    molecularWeight: '5312.76 Da',
    sequence: 'Dual receptor agonist peptide',
    variants: [
      {
        id: 'sur-10mg',
        size: '10mg',
        price: 139.99,
        sku: 'SUR-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '16',
    name: 'TB-500 (Thymosin Beta-4)',
    category: 'Therapeutic Peptides',
    description: 'Naturally occurring peptide with wound healing and anti-inflammatory properties.',
    price: 24.99,
    image: 'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C212H350N56O78S',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, saline',
      'Research Use': 'Wound healing studies'
    },
    inStock: true,
    sku: 'TB500-5MG',
    purity: '≥95%',
    molecularWeight: '4963.44 Da',
    sequence: 'LKKTETQ',
    variants: [
      {
        id: 'tb500-5mg',
        size: '5mg',
        price: 24.99,
        sku: 'TB500-5MG',
        inStock: true
      }
    ]
  },
  {
    id: '17',
    name: 'Testagen',
    category: 'Research Peptides',
    description: 'Synthetic tetrapeptide with potential anti-aging and cellular regeneration properties for research applications.',
    price: 49.99,
    image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C17H28N6O9',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, saline solution',
      'Research Use': 'Anti-aging and cellular studies'
    },
    inStock: true,
    sku: 'TEST-20MG',
    purity: '≥98%',
    molecularWeight: '460.44 Da',
    sequence: 'Lys-Glu-Asp-Gly',
    variants: [
      {
        id: 'test-20mg',
        size: '20mg',
        price: 49.99,
        sku: 'TEST-20MG',
        inStock: true
      }
    ]
  },
  {
    id: '18',
    name: 'Tesamorelin',
    category: 'Therapeutic Peptides',
    description: 'Growth hormone releasing hormone analog for lipodystrophy and metabolic research applications.',
    price: 125.99,
    image: 'https://images.pexels.com/photos/3786164/pexels-photo-3786164.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C221H366N72O67S',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Sterile water, bacteriostatic water',
      'Research Use': 'Lipodystrophy and metabolic studies'
    },
    inStock: true,
    sku: 'TES-10MG',
    purity: '≥98%',
    molecularWeight: '5135.77 Da',
    sequence: 'Tyr-Ala-Asp-Ala-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg-trans-3-hexenoyl-NH2',
    variants: [
      {
        id: 'tes-10mg',
        size: '10mg',
        price: 125.99,
        sku: 'TES-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '19',
    name: 'Thymosin Alpha1',
    category: 'Therapeutic Peptides',
    description: 'Immunomodulatory peptide with potential therapeutic applications for immune system enhancement and research.',
    price: 54.99,
    image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C129H215N33O55',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, saline solution',
      'Research Use': 'Immune system studies'
    },
    inStock: true,
    sku: 'TA1-5MG',
    purity: '≥98%',
    molecularWeight: '3108.31 Da',
    sequence: 'Ac-Ser-Asp-Ala-Ala-Val-Asp-Thr-Ser-Ser-Glu-Ile-Thr-Thr-Lys-Asp-Leu-Lys-Glu-Lys-Lys-Glu-Val-Val-Glu-Glu-Ala-Glu-Asn-OH',
    variants: [
      {
        id: 'ta1-5mg',
        size: '5mg',
        price: 54.99,
        sku: 'TA1-5MG',
        inStock: true
      },
      {
        id: 'ta1-10mg',
        size: '10mg',
        price: 109.99,
        sku: 'TA1-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '20',
    name: 'Thymosin Beta 4 (TB500)',
    category: 'Therapeutic Peptides',
    description: 'Naturally occurring peptide for tissue repair and regeneration research applications. For Research Only - Not for human consumption.',
    price: 75.99,
    image: 'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C212H350N56O78S',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Water, saline',
      'Research Use': 'Wound healing and tissue repair studies'
    },
    inStock: true,
    sku: 'TB4-10MG',
    purity: '≥95%',
    molecularWeight: '4963.44 Da',
    sequence: 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser-OH',
    variants: [
      {
        id: 'tb4-10mg',
        size: '10mg',
        price: 75.99,
        sku: 'TB4-10MG',
        inStock: true
      }
    ]
  },
  {
    id: '21',
    name: 'Tirzepatide',
    category: 'Therapeutic Peptides',
    description: 'Dual GIP/GLP-1 receptor agonist peptide for advanced metabolic research and diabetes studies.',
    price: 149.99,
    image: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=600',
    specifications: {
      'Molecular Formula': 'C225H348N48O68',
      'Storage': '-20°C, lyophilized',
      'Solubility': 'Sterile water, bacteriostatic water',
      'Research Use': 'Metabolic and diabetes studies'
    },
    inStock: true,
    sku: 'TIR-10MG',
    purity: '≥98%',
    molecularWeight: '4813.53 Da',
    sequence: 'Dual GIP/GLP-1 receptor agonist peptide',
    variants: [
      {
        id: 'tir-10mg',
        size: '10mg',
        price: 149.99,
        sku: 'TIR-10MG',
        inStock: true
      },
      {
        id: 'tir-30mg',
        size: '30mg',
        price: 399.99,
        sku: 'TIR-30MG',
        inStock: true
      }
    ]
  }
];