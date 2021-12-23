import { JSDOM } from 'jsdom';
import got from 'got';

const BASE_URL = 'https://afkhelper.nax.is';

export enum Towers {
  Kings,
  Lightbearer,
  Mauler,
  Wilder,
  Graveborn,
  Celestial,
  Hypogean,
}

const GotOptions = {
  headers: {
    'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36`,
  },
};

export function AFKHelperGetCampaignSolution(
  chapter: number,
  stage: number,
  count: number
): Promise<string[]> {
  if (chapter < 1 || stage < 1 || stage > 60) {
    return Promise.resolve(['What are you doing? ಠ_ಠ']);
  }
  if (chapter > 42) {
    return Promise.resolve([':whale:']);
  }

  return got(
    `${BASE_URL}/campaign.php?chapter=${chapter}&stage=${stage}`,
    GotOptions
  )
    .then(response => {
      const dom = new JSDOM(response.body);

      const images = [
        ...dom.window.document.querySelectorAll("a[href*='images/chapters/']"),
      ];

      if (images.length == 0)
        return Promise.resolve(['There are no solutions for that stage.']);

      return Promise.resolve(
        images
          .map(x => {
            const href = x.getAttribute('href');
            if (href?.length) return `${BASE_URL}${href}`;
            else return '';
          })
          .filter(x => x.length != 0)
          .slice(0, count)
      );
    })
    .catch(err => {
      console.error(err);
      return Promise.resolve(['An error occurred while performing the query.']);
    });
}

export function AFKHelperGetTowerSolution(
  tower: Towers,
  floor: number,
  count: number
): Promise<string[]> {
  if (floor < 1 || floor > 1000) {
    return Promise.resolve(['What are you doing? ಠ_ಠ']);
  }

  let towerName = '';

  switch (tower) {
    case Towers.Kings:
      towerName = `kings_tower`;
      break;
    case Towers.Lightbearer:
      towerName = `tower_of_light`;
      break;
    case Towers.Mauler:
      towerName = `the_brutal_citadel`;
      break;
    case Towers.Wilder:
      towerName = `the_world_tree`;
      break;
    case Towers.Graveborn:
      towerName = `the_forsaken_necropolis`;
      break;
    case Towers.Celestial:
      towerName = `celestial_sanctum`;
      break;
    case Towers.Hypogean:
      towerName = `infernal_fortress`;
      break;
    default:
      return Promise.resolve(['What are you doing? ಠ_ಠ']);
  }

  return got(`${BASE_URL}/${towerName}.php?floor=${floor}`, GotOptions)
    .then(response => {
      const dom = new JSDOM(response.body);

      const images = [
        ...dom.window.document.querySelectorAll(
          `a[href*='images/${towerName}/']`
        ),
      ];

      if (images.length == 0)
        return Promise.resolve(['There are no solutions for that stage.']);

      return Promise.resolve(
        images
          .map(x => {
            const href = x.getAttribute('href');
            if (href?.length) return `${BASE_URL}${href}`;
            else return '';
          })
          .filter(x => x.length != 0)
          .slice(0, count)
      );
    })
    .catch(err => {
      console.error(err);
      return Promise.resolve(['An error occurred while performing the query.']);
    });
}
