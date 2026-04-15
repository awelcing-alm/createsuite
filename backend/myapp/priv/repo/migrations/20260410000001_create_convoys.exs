defmodule Backend.Repo.Migrations.CreateConvoys do
  use Ecto.Migration

  def change do
    create table(:convoys, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:cs_id, :string, null: false)
      add(:name, :string, null: false)
      add(:description, :text)

      timestamps(type: :utc_datetime_usec)
    end

    create(unique_index(:convoys, [:cs_id]))
  end
end
