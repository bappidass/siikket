export interface IdCardProps {
  backgroundUrl: string;
  avatarUrl: string;
  name: string;
  organization: string;
  role: string;
  zones: string;
  location: string;
  category: string;
}

export function IdCard({
  backgroundUrl,
  avatarUrl,
  name,
  organization,
  role,
  zones,
  location,
  category,
}: IdCardProps) {
  return (
    <div
      className="relative w-[360px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="absolute inset-x-14 top-[28%] bottom-[20%] bg-white rounded-sm flex flex-col items-center px-4 py-4 text-center">
        <div className="w-24 h-28 border border-neutral-300 overflow-hidden mb-3">
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-[15px] font-bold tracking-wide text-neutral-900 uppercase">
          {name}
        </h2>
        <p className="text-[12px] font-semibold text-neutral-800 uppercase mt-1 leading-tight">
          {organization}
        </p>
        <p className="text-[12px] font-semibold text-neutral-800 uppercase leading-tight">
          {role}
        </p>

        <div className="mt-3 border-b-2 border-neutral-800 px-4 pb-1">
          <span className="text-[16px] font-bold text-neutral-900 tracking-widest">
            {zones}
          </span>
        </div>

        <h3 className="mt-auto text-[15px] font-bold text-neutral-900 uppercase tracking-wide">
          {location}
        </h3>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-[14%] bg-white border border-neutral-800 px-6 py-1 rounded-sm">
        <span className="text-[13px] font-bold tracking-widest text-neutral-900">
          {category}
        </span>
      </div>
    </div>
  );
}
