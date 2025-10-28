/*
  # Insert Products Part 1

  Inserts first batch of products from the catalog.
*/

INSERT INTO products (name, sku, category, description, price, sequence, in_stock) VALUES
('NAD+ (Nicotinamide Adenine Dinucleotide)', 'NAD-500MG', 'Research Peptides', 'Essential coenzyme involved in cellular energy metabolism, DNA repair, and anti-aging research applications.', 64.99, 'Nicotinamide adenine dinucleotide', true),
('CJC-1295', 'CJC-10MG', 'Research Peptides', 'Long-acting growth hormone releasing hormone analog for research applications.', 89.99, 'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-Lys', true),
('CJC-1295 DAC', 'CJC-DAC-2MG', 'Therapeutic Peptides', 'Long-acting growth hormone releasing hormone analog with Drug Affinity Complex for extended half-life.', 79.99, 'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-Lys', true),
('CJC-1295 Ipamorelin', 'CJC-IPA-10MG', 'Research Peptides', 'Synergistic combination of CJC-1295 and Ipamorelin for growth hormone research.', 74.99, 'CJC-1295 + Ipamorelin combination', true),
('Ipamorelin', 'IPA-5MG', 'Research Peptides', 'Growth hormone releasing peptide with selective ghrelin receptor activity.', 59.99, 'Aib-His-D-2-Nal-D-Phe-Lys-NH2', true),
('Melanotan II', 'MT2-10MG', 'Research Peptides', 'Synthetic analog of melanocyte-stimulating hormone for pigmentation research.', 38.99, 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2', true),
('PE-22-28', 'PE22-10MG', 'Research Peptides', 'Synthetic peptide with cognitive enhancement and neuroprotective properties.', 74.99, 'Research peptide sequence', true),
('PT-141', 'PT141-5MG', 'Research Peptides', 'Melanocortin receptor agonist peptide for sexual dysfunction research.', 56.99, 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2', true),
('Retatrutide', 'RET-24MG', 'Therapeutic Peptides', 'Triple agonist peptide targeting GLP-1, GIP, and glucagon receptors.', 249.99, 'Triple receptor agonist peptide', true),
('Selank', 'SEL-5MG', 'Research Peptides', 'Synthetic heptapeptide with anxiolytic and nootropic properties.', 49.99, 'Thr-Lys-Pro-Arg-Pro-Gly-Pro', true),
('Semaglutide', 'SEMA-5MG', 'Therapeutic Peptides', 'GLP-1 receptor agonist peptide for metabolic research and diabetes studies.', 89.99, 'His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly', true)
ON CONFLICT (sku) DO NOTHING;