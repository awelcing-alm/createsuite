defmodule Backend.Agents.Agent do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @statuses ~w(idle working offline error)
  @capabilities_separator ","

  schema "agents" do
    field(:name, :string)
    field(:status, :string, default: "idle")
    field(:capabilities, {:array, :string}, default: [])
    field(:current_task_id, :binary_id)

    has_many(:assigned_tasks, Backend.Tasks.Task, foreign_key: :assigned_agent_id)
    has_many(:messages, Backend.Messaging.Message)

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(agent, attrs) do
    attrs = parse_capabilities(attrs)

    agent
    |> cast(attrs, [:name, :status, :capabilities, :current_task_id])
    |> validate_required([:name, :status])
    |> validate_inclusion(:status, @statuses)
    |> validate_length(:name, min: 1)
    |> unique_constraint(:name)
  end

  defp parse_capabilities(%{"capabilities" => s} = attrs) when is_binary(s) do
    %{
      attrs
      | "capabilities" =>
          String.split(s, @capabilities_separator)
          |> Enum.map(&String.trim/1)
          |> Enum.reject(&(&1 == ""))
    }
  end

  defp parse_capabilities(%{capabilities: s} = attrs) when is_binary(s) do
    %{
      attrs
      | capabilities:
          String.split(s, @capabilities_separator)
          |> Enum.map(&String.trim/1)
          |> Enum.reject(&(&1 == ""))
    }
  end

  defp parse_capabilities(attrs), do: attrs
end
