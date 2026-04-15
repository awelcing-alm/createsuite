defmodule Backend.Repo.Migrations.CreateTasks do
  use Ecto.Migration

  def change do
    create table(:tasks, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:cs_id, :string, null: false)
      add(:title, :string, null: false)
      add(:description, :text)
      add(:status, :string, null: false, default: "open")
      add(:priority, :string, null: false, default: "medium")
      add(:tags, {:array, :string}, null: false, default: [])
      add(:completed_at, :utc_datetime_usec)
      add(:assigned_agent_id, references(:agents, type: :binary_id, on_delete: :nilify_all))
      add(:convoy_id, references(:convoys, type: :binary_id, on_delete: :nilify_all))

      timestamps(type: :utc_datetime_usec)
    end

    create(unique_index(:tasks, [:cs_id]))
    create(index(:tasks, [:status]))
    create(index(:tasks, [:assigned_agent_id]))
    create(index(:tasks, [:convoy_id]))
  end
end
