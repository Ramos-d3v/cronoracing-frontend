import logoImage from '../../assets/logo.jpeg'

export function Logo({ href = '#top', className = '', imageClassName = 'h-12 w-12', secondaryClassName = '' }) {
  return (
    <a className={`logo flex items-center gap-3 !tracking-normal ${className}`} href={href} aria-label="CronoRacing início">
      <img className={`shrink-0 rounded-sm object-contain ${imageClassName}`} src={logoImage} alt="" />
      <span className="whitespace-nowrap">CRONO<span className={secondaryClassName}>RACING</span></span>
    </a>
  )
}
