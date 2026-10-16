export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  outline: boolean;
  fullWidth: boolean;
}

/**
 * The single source of button appearance, shared by `UiButton` (a <button>) and
 * `UiLinkButton` (a <NuxtLink>).
 *
 * They used to carry two independent copies of this logic and had drifted
 * apart: LinkButton was rounded-xl against Button's rounded-full, a flat
 * primary against Button's gradient, border-2 outlines against border, and
 * gray-100 secondaries against the surface tokens. Two controls that read as
 * the same button rendered differently depending on whether the destination
 * happened to be a route.
 *
 * Disabled styling is deliberately NOT here: <button> uses the `disabled:`
 * variant, while <a> has no :disabled pseudo-class and must apply it manually.
 */
export const useButtonStyles = () => {
  const buttonClasses = ({
    variant,
    size,
    outline,
    fullWidth,
  }: ButtonStyleOptions): string => {
    const baseClasses =
      'flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 active:scale-95';

    const variantClasses: Record<ButtonVariant, string> = {
      primary: outline
        ? 'border border-primary-600/20 dark:border-primary-400/30 text-primary-600 dark:text-primary-400 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500 dark:focus:ring-primary-400'
        : // DESIGN.md: "Use the glow shadow for primary interactive states"
          'bg-linear-to-br from-primary-700 to-primary-600 text-white hover:opacity-90 focus:ring-primary-600 focus:shadow-glow shadow-md hover:shadow-lg',
      secondary: outline
        ? 'border border-gray-400/20 text-gray-700 dark:text-gray-200 bg-transparent hover:bg-surface-high dark:hover:bg-gray-700 focus:ring-gray-400'
        : 'bg-surface-high dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-surface-highest dark:hover:bg-gray-600 focus:ring-gray-400 shadow-sm',
      ghost:
        'text-primary-600 dark:text-primary-400 hover:bg-primary-50/60 dark:hover:bg-primary-900/20 focus:ring-primary-400 bg-transparent',
      // error-600 on a dark surface measures ~2.8:1 (fails AA); error-400
      // clears it, matching the primary outline pairing.
      danger: outline
        ? 'border border-error-600/20 dark:border-error-400/30 text-error-600 dark:text-error-400 bg-transparent hover:bg-error-50 dark:hover:bg-error-900/20 focus:ring-error-500 dark:focus:ring-error-400'
        : 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-md hover:shadow-lg',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 gap-1 py-2 text-sm',
      md: 'px-4 gap-2 py-2.5 text-sm',
      lg: 'px-6 gap-3 py-3 text-base',
    };

    return [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  const iconSizeClasses = (size: ButtonSize): string =>
    ({ sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' })[size];

  return { buttonClasses, iconSizeClasses };
};
