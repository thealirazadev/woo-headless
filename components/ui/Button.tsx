import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactElement } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, 'href' | 'className'> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const BASE_CLASSES =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold ' +
  'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'border border-border bg-surface text-fg hover:bg-surface-2',
  ghost: 'bg-transparent text-fg hover:bg-surface-2',
  danger: 'bg-transparent text-danger hover:bg-surface-2',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-10 px-4',
  sm: 'h-9 px-3',
};

/** Shared button primitive. Renders a `<button>`, or a `next/link` when `href` is given. */
export function Button(props: ButtonProps): ReactElement {
  const { variant = 'primary', size = 'md', className = '' } = props;
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className]
    .filter(Boolean)
    .join(' ');

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {props.children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, ...buttonProps } = props;
  return (
    <button className={classes} {...buttonProps}>
      {props.children}
    </button>
  );
}
