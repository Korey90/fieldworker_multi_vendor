import { Badge } from "@/components/ui/badge"
import { Label } from "@radix-ui/react-label";
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command";

function AssignedWorkersSelect({ workers, data, setData }) {
  return (
    <div>
      <Label>Assigned Workers</Label>
      <Command className="mt-2 border rounded-md">
        <CommandInput placeholder="Search workers..." />
        <CommandList className="max-h-60 overflow-y-auto">
          {workers.map((worker) => {
            const selected = data.assigned_user_ids.includes(worker.id.toString());
            return (
              <CommandItem
                key={worker.id}
                onSelect={() => {
                  if (selected) {
                    setData("assigned_user_ids", data.assigned_user_ids.filter(id => id !== worker.id.toString()));
                  } else {
                    setData("assigned_user_ids", [...data.assigned_user_ids, worker.id.toString()]);
                  }
                }}
              >
                <span className={selected ? "font-medium text-primary" : ""}>
                  {worker.first_name} {worker.last_name} ({worker.email})
                </span>
              </CommandItem>
            );
          })}
        </CommandList>
      </Command>

      {/* Wybrane jako "tagi" */}
      <div className="mt-3 flex flex-wrap gap-2">
        {data.assigned_user_ids.map((id) => {
          const w = workers.find((x) => x.id.toString() === id);
          if (!w) return null;
          return (
            <Badge key={id} variant="secondary" className="px-2 py-1">
              {w.first_name} {w.last_name}
              <button
                type="button"
                className="ml-2 text-xs"
                onClick={() =>
                  setData(
                    "assigned_user_ids",
                    data.assigned_user_ids.filter((wid) => wid !== id)
                  )
                }
              >
                ✕
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

export default AssignedWorkersSelect;
