import type { CompanyNode } from '@/components/ui/TreeSelect/types'

/**
 * Nodes 1..3 of the first branch reproduce Figma 10489:78221 exactly — the panel's
 * visible top must match the frame. Everything after `lkq` exists so the tree has
 * ~40 leaves, which is what makes the `+30` overflow chip in the review screens
 * reachable, and gives the country filter something to bite on.
 *
 * 'Euro Car Parts Irland' is a typo in the Figma. Reproduce it. See spec §7.5.
 */
export const COMPANY_TREE: CompanyNode[] = [
  {
    id: 'lkq',
    label: 'LKQ Corporation',
    country: 'United States',
    children: [
      {
        id: 'lkq.ecp',
        label: 'Euro Car Parts',
        country: 'United Kingdom',
        children: [
          { id: 'lkq.ecp.ltd', label: 'Euro Car Parts Ltd', country: 'United Kingdom' },
          { id: 'lkq.ecp.irl', label: 'Euro Car Parts Irland', country: 'Ireland' },
          { id: 'lkq.ecp.gmbh', label: 'Euro Car Parts GmbH', country: 'Germany' },
        ],
      },
      {
        id: 'lkq.ak',
        label: 'Auto Kelly',
        country: 'Czechia',
        children: [
          { id: 'lkq.ak.cz', label: 'Auto Kelly a.s.', country: 'Czechia' },
          { id: 'lkq.ak.sk', label: 'Auto Kelly Slovakia', country: 'Slovakia' },
          { id: 'lkq.ak.pl', label: 'Auto Kelly Polska', country: 'Poland' },
        ],
      },
      {
        id: 'lkq.akl',
        label: 'Auto Kelly Ltd',
        country: 'United Kingdom',
        children: [
          { id: 'lkq.akl.north', label: 'Auto Kelly Ltd North', country: 'United Kingdom' },
          { id: 'lkq.akl.south', label: 'Auto Kelly Ltd South', country: 'United Kingdom' },
        ],
      },
    ],
  },
  {
    id: 'stahlgruber',
    label: 'Stahlgruber Group',
    country: 'Germany',
    children: [
      {
        id: 'stahlgruber.de',
        label: 'Stahlgruber GmbH',
        country: 'Germany',
        children: [
          { id: 'stahlgruber.de.munich', label: 'Stahlgruber München', country: 'Germany' },
          { id: 'stahlgruber.de.berlin', label: 'Stahlgruber Berlin', country: 'Germany' },
          { id: 'stahlgruber.de.hamburg', label: 'Stahlgruber Hamburg', country: 'Germany' },
        ],
      },
      {
        id: 'stahlgruber.at',
        label: 'Stahlgruber Austria',
        country: 'Austria',
        children: [
          { id: 'stahlgruber.at.vienna', label: 'Stahlgruber Wien', country: 'Austria' },
          { id: 'stahlgruber.at.graz', label: 'Stahlgruber Graz', country: 'Austria' },
          { id: 'stahlgruber.at.linz', label: 'Stahlgruber Linz', country: 'Austria' },
        ],
      },
      {
        id: 'stahlgruber.ch',
        label: 'Stahlgruber Switzerland',
        country: 'Switzerland',
        children: [
          { id: 'stahlgruber.ch.zurich', label: 'Stahlgruber Zürich', country: 'Switzerland' },
          { id: 'stahlgruber.ch.geneva', label: 'Stahlgruber Geneva', country: 'Switzerland' },
          { id: 'stahlgruber.ch.basel', label: 'Stahlgruber Basel', country: 'Switzerland' },
          { id: 'stahlgruber.ch.bern', label: 'Stahlgruber Bern', country: 'Switzerland' },
        ],
      },
    ],
  },
  {
    id: 'rhiag',
    label: 'Rhiag Group',
    country: 'Italy',
    children: [
      {
        id: 'rhiag.it',
        label: 'Rhiag Italia',
        country: 'Italy',
        children: [
          { id: 'rhiag.it.milan', label: 'Rhiag Milano', country: 'Italy' },
          { id: 'rhiag.it.rome', label: 'Rhiag Roma', country: 'Italy' },
          { id: 'rhiag.it.turin', label: 'Rhiag Torino', country: 'Italy' },
        ],
      },
      {
        id: 'rhiag.fr',
        label: 'Rhiag France',
        country: 'France',
        children: [
          { id: 'rhiag.fr.paris', label: 'Rhiag Paris', country: 'France' },
          { id: 'rhiag.fr.lyon', label: 'Rhiag Lyon', country: 'France' },
          { id: 'rhiag.fr.marseille', label: 'Rhiag Marseille', country: 'France' },
        ],
      },
      {
        id: 'rhiag.es',
        label: 'Rhiag Iberia',
        country: 'Spain',
        children: [
          { id: 'rhiag.es.madrid', label: 'Rhiag Madrid', country: 'Spain' },
          { id: 'rhiag.es.barcelona', label: 'Rhiag Barcelona', country: 'Spain' },
          { id: 'rhiag.es.valencia', label: 'Rhiag Valencia', country: 'Spain' },
          { id: 'rhiag.es.seville', label: 'Rhiag Seville', country: 'Spain' },
        ],
      },
    ],
  },
  {
    id: 'sator',
    label: 'Sator Group',
    country: 'Netherlands',
    children: [
      {
        id: 'sator.nl',
        label: 'Sator Nederland',
        country: 'Netherlands',
        children: [
          { id: 'sator.nl.amsterdam', label: 'Sator Amsterdam', country: 'Netherlands' },
          { id: 'sator.nl.rotterdam', label: 'Sator Rotterdam', country: 'Netherlands' },
          { id: 'sator.nl.utrecht', label: 'Sator Utrecht', country: 'Netherlands' },
        ],
      },
      {
        id: 'sator.be',
        label: 'Sator Belgium',
        country: 'Belgium',
        children: [
          { id: 'sator.be.brussels', label: 'Sator Brussels', country: 'Belgium' },
          { id: 'sator.be.antwerp', label: 'Sator Antwerp', country: 'Belgium' },
          { id: 'sator.be.ghent', label: 'Sator Ghent', country: 'Belgium' },
        ],
      },
      {
        id: 'sator.pl',
        label: 'Sator Polska',
        country: 'Poland',
        children: [
          { id: 'sator.pl.warsaw', label: 'Sator Warszawa', country: 'Poland' },
          { id: 'sator.pl.krakow', label: 'Sator Kraków', country: 'Poland' },
          { id: 'sator.pl.gdansk', label: 'Sator Gdańsk', country: 'Poland' },
          { id: 'sator.pl.poznan', label: 'Sator Poznań', country: 'Poland' },
        ],
      },
    ],
  },
]
