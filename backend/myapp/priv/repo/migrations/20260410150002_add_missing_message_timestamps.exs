defmodule Backend.Repo.Migrations.AddMissingMessageTimestamps do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:updated_at, :utc_datetime_usec, null: false, default: fragment("NOW()"))
    end
  end
end
