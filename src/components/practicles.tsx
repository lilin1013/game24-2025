import React, { FC } from 'react';

import Particles from 'react-particles';
import { useEffect } from 'react';
interface Props {
  width: string;
  height: string;
}

const RoundResult: FC<Props> = ({ width, height }) => {
   

  const config = {
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: ['#ff0000', '#00ff00', '#0000ff'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.5,
        random: true,
      },
      size: {
        value: 5,
        random: true,
        anim: {
          enable: false,
          speed: 30,
          size_min: 0.1,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 10,
        direction: 'bottom',
        straight: true,
        out_mode: 'out',
      },
    },
    interactivity: {
      events: {
        onhover: {
          enable: false,
          mode: 'repulse',
        },
        onclick: {
          enable: true,
          mode: 'push',
        },
      },
      modes: {
        push: {
          particles_nb: 3,
        },
      },
    },
  }
    return (
      <Particles
      width={width}
      height={height}
      params={config}
    />
    );
};

export default RoundResult;