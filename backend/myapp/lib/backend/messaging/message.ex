defmodule Backend.Messaging.Message do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "messages" do
    field(:sender, :string, default: "system")
    field(:content, :string)
    field(:read, :boolean, default: false)

    belongs_to(:agent, Backend.Agents.Agent)

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(message, attrs) do
    message
    |> cast(attrs, [:sender, :content, :read, :agent_id])
    |> validate_required([:sender, :content, :agent_id])
    |> validate_length(:content, min: 1)
    |> foreign_key_constraint(:agent_id)
  end
end
