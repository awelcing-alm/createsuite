defmodule Backend.Convoys.Convoy do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "convoys" do
    field(:cs_id, :string)
    field(:name, :string)
    field(:description, :string)

    has_many(:tasks, Backend.Tasks.Task)

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(convoy, attrs) do
    convoy
    |> cast(attrs, [:cs_id, :name, :description])
    |> validate_required([:cs_id, :name])
    |> validate_length(:name, min: 1)
    |> unique_constraint(:cs_id)
  end
end
