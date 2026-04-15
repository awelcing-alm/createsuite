defmodule Backend.Repo.Migrations.CreateAgents do
  use Ecto.Migration

  def change do
    create table(:agents, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:name, :string, null: false)
      add(:status, :string, null: false, default: "idle")
      add(:capabilities, {:array, :string}, null: false, default: [])
      add(:current_task_id, :binary_id)

      timestamps(type: :utc_datetime_usec)
    end

    create(unique_index(:agents, [:name]))
    create(index(:agents, [:status]))
  end
end
