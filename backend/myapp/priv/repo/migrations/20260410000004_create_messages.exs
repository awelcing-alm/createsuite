defmodule Backend.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:sender, :string, null: false, default: "system")
      add(:content, :text, null: false)
      add(:read, :boolean, null: false, default: false)
      add(:agent_id, references(:agents, type: :binary_id, on_delete: :delete_all), null: false)

      timestamps(type: :utc_datetime_usec)
    end

    create(index(:messages, [:agent_id]))
    create(index(:messages, [:read]))
  end
end
