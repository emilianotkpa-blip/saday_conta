import { MXN, shade } from '../lib/format.js'

export default function ProjectOrb({ project, balance, index, onOpen }) {
  return (
    <button
      className="orb floaty"
      style={{ animationDelay: `${index * 0.7}s` }}
      onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}
    >
      <span
        className="planet"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${project.color}, ${shade(project.color, -50)} 70%, transparent)`,
        }}
      />
      <span className="pname">{project.name}</span>
      <span className="pmeta">{project.meta}</span>
      <span className={`pbal mono ${balance >= 0 ? 'pos' : 'neg'}`}>{MXN.format(balance)}</span>
      <span className="arrow">♥</span>
    </button>
  )
}
