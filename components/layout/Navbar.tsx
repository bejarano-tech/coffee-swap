import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../ui/button';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav className="bg-slate-900 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href={'/'} className='flex items-center'>
            <Image src={'/coffee-swap.svg'} width={40} height={40} alt={'CoffeSwap Logo'} />
            <h1 className="ms-4 text-xl font-bold text-white">CoffeSwap</h1>
          </Link>
          <Link href={'/'}>
            <Button className='ms-4 text-white' variant={'link'}>Swap</Button>
          </Link>
          <Link href={'/tokens'}>
            <Button className='text-white' variant={'link'}>Tokens</Button>
          </Link>
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
}
