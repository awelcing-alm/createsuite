defmodule Backend.Tasks.Task do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @statuses ~w(open in_progress completed blocked)
  @priorities ~w(low medium high critical)

  schema "tasks" do
    field(:cs_id, :string)
    field(:title, :string)
    field(:description, :string)
    field(:status, :string, default: "open")
    field(:priority, :string, default: "medium")
    field(:tags, {:array, :string}, default: [])
    field(:completed_at, :utc_datetime_usec)

    belongs_to(:assigned_agent, Backend.Agents.Agent)
    belongs_to(:convoy, Backend.Convoys.Convoy)

    timestamps(type: :utc_datetime_usec)
  end

  def create_changeset(task, attrs) do
    task
    |> cast(attrs, [
      :cs_id,
      :title,
      :description,
      :status,
      :priority,
      :tags,
      :assigned_agent_id,
      :convoy_id,
      :completed_at
    ])
    |> validate_required([:cs_id, :title, :status, :priority])
    |> validate_inclusion(:status, @statuses)
    |> validate_inclusion(:priority, @priorities)
    |> unique_constraint(:cs_id)
    |> foreign_key_constraint(:assigned_agent_id)
    |> foreign_key_constraint(:convoy_id)
  end

  def update_changeset(task, attrs) do
    task
    |> cast(attrs, [
      :title,
      :description,
      :status,
      :priority,
      :tags,
      :assigned_agent_id,
      :convoy_id,
      :completed_at
    ])
    |> validate_required([:title, :status, :priority])
    |> validate_inclusion(:status, @statuses)
    |> validate_inclusion(:priority, @priorities)
    |> foreign_key_constraint(:assigned_agent_id)
    |> foreign_key_constraint(:convoy_id)
  end
end
