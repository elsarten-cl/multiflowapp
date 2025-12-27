import Image from 'next/image';
import type { SVGProps } from 'react';

const logo = (props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) => (
  <Image
    src="https://emprendedores.app/wp-content/uploads/2025/12/Logo-MultiFlow-App-low.png"
    alt="MultiFlowApp Logo"
    {...props}
    width={props.width || 32}
    height={props.height || 32}
  />
);

export const Icons = {
  logo,
};
