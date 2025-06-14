'use client';
import { useState } from 'react';
import {
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react';
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
} from '@heroicons/react/24/outline';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Header } from 'next/dist/lib/load-custom-routes';

interface Product {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface CallToAction {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const products: Product[] = [
  { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#', icon: ChartPieIcon },
  { name: 'Engagement', description: 'Speak directly to your customers', href: '#', icon: CursorArrowRaysIcon },
  { name: 'Security', description: 'Your customers’ data will be safe and secure', href: '#', icon: FingerPrintIcon },
  { name: 'Integrations', description: 'Connect with third-party tools', href: '#', icon: SquaresPlusIcon },
  { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#', icon: ArrowPathIcon },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const callsToAction: CallToAction[] = [
  { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '#', icon: PhoneIcon },
];

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-black">

<PopoverGroup>
      <Popover>
        <PopoverButton className="bg-blue-500 text-white px-4 py-2 rounded">
          Open Popover
        </PopoverButton>
        <PopoverPanel className="absolute z-10 bg-white p-4 shadow-lg">
          <p>This is the content of the popover.</p>
        </PopoverPanel>
      </Popover>
      {/* You can add more Popover components here if needed */}
    </PopoverGroup>

      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <Image
              alt=""
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden">
            {/* Mobile menu items go here */}
            <div className="space-y-1 px-2 pt-2 pb-3">
              {products.map((product) => (
                <a
                  key={product.name}
                  href={product.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  {product.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

