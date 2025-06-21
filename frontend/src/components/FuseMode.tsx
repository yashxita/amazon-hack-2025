'use client';

import {
  useRive,
  Layout,
  Fit,
  Alignment,
} from '@rive-app/react-canvas';


export default function FuseMode({ className = '' }: { className?: string }) {
  const { RiveComponent } = useRive({
    src: '/FuseMode.riv',
    artboard: 'Artboard 2',
    stateMachines: 'State Machine 1',
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  return <RiveComponent className={className} />;
}