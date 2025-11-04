/*
  # Insert Products Part 2

  Inserts second batch of products from the catalog.
*/

INSERT INTO products (name, sku, category, description, price, sequence, in_stock) VALUES
('Semax', 'SEMAX-30MG', 'Research Peptides', 'Synthetic heptapeptide analog of ACTH with neuroprotective properties.', 129.99, 'Met-Glu-His-Phe-Pro-Gly-Pro', true),
('Sermorelin', 'SER-5MG', 'Therapeutic Peptides', 'Growth hormone releasing hormone fragment for endocrine research.', 139.99, 'Tyr-Ala-Asp-Ala-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg-NH2', true),
('SS-31', 'SS31-10MG', 'Research Peptides', 'Mitochondria-targeting peptide with cardioprotective properties.', 49.99, 'D-Arg-Dmt-Lys-Phe-NH2', true),
('Survodutide', 'SUR-10MG', 'Therapeutic Peptides', 'Dual GLP-1 glucagon receptor agonist peptide for metabolic research.', 139.99, 'Dual receptor agonist peptide', true),
('TB-500', 'TB500-5MG', 'Therapeutic Peptides', 'Naturally occurring peptide with wound healing and anti-inflammatory properties.', 24.99, 'LKKTETQ', true),
('Testagen', 'TEST-20MG', 'Research Peptides', 'Synthetic tetrapeptide with anti-aging and cellular regeneration properties.', 49.99, 'Lys-Glu-Asp-Gly', true),
('Tesamorelin', 'TES-10MG', 'Therapeutic Peptides', 'Growth hormone releasing hormone analog for lipodystrophy research.', 125.99, 'Tyr-Ala-Asp-Ala-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg', true),
('Thymosin Alpha1', 'TA1-5MG', 'Therapeutic Peptides', 'Immunomodulatory peptide for immune system enhancement research.', 54.99, 'Ac-Ser-Asp-Ala-Ala-Val-Asp-Thr-Ser-Ser-Glu-Ile-Thr-Thr-Lys-Asp-Leu-Lys-Glu-Lys-Lys-Glu-Val-Val-Glu-Glu-Ala-Glu-Asn-OH', true),
('Thymosin Beta 4', 'TB4-10MG', 'Therapeutic Peptides', 'Naturally occurring peptide for tissue repair and regeneration research.', 75.99, 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser-OH', true),
('Tirzepatide', 'TIR-10MG', 'Therapeutic Peptides', 'Dual GIP GLP-1 receptor agonist peptide for metabolic research.', 149.99, 'Dual GIP GLP-1 receptor agonist peptide', true)
ON CONFLICT (sku) DO NOTHING;