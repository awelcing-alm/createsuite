defmodule Backend.Repo.Migrations.RenameMessageBodyToContent do
  use Ecto.Migration

  def change do
    rename(table(:messages), :body, to: :content)
  end
end
