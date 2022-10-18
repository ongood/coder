import CircularProgress from "@material-ui/core/CircularProgress"
import { makeStyles } from "@material-ui/core/styles"
import TextField from "@material-ui/core/TextField"
import Autocomplete from "@material-ui/lab/Autocomplete"
import { useMachine } from "@xstate/react"
import { Group, User } from "api/typesGenerated"
import { AvatarData } from "components/AvatarData/AvatarData"
import debounce from "just-debounce-it"
import { ChangeEvent, useState } from "react"
import { getGroupSubtitle } from "util/groups"
import { searchUsersAndGroupsMachine } from "xServices/template/searchUsersAndGroupsXService"

export type UserOrGroupAutocompleteValue = User | Group | null

const isGroup = (value: UserOrGroupAutocompleteValue): value is Group => {
  return value !== null && "members" in value
}

export type UserOrGroupAutocompleteProps = {
  value: UserOrGroupAutocompleteValue
  onChange: (value: UserOrGroupAutocompleteValue) => void
  organizationId: string
  exclude: UserOrGroupAutocompleteValue[]
}

export const UserOrGroupAutocomplete: React.FC<
  UserOrGroupAutocompleteProps
> = ({ value, onChange, organizationId, exclude }) => {
  const styles = useStyles()
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [searchState, sendSearch] = useMachine(searchUsersAndGroupsMachine, {
    context: {
      userResults: [],
      groupResults: [],
      organizationId,
    },
  })
  const { userResults, groupResults } = searchState.context
  const options = [...groupResults, ...userResults].filter((result) => {
    const excludeIds = exclude.map((optionToExclude) => optionToExclude?.id)
    return !excludeIds.includes(result.id)
  })

  const handleFilterChange = debounce(
    (event: ChangeEvent<HTMLInputElement>) => {
      sendSearch("SEARCH", { query: event.target.value })
    },
    500,
  )

  return (
    <Autocomplete
      value={value}
      id="user-or-group-autocomplete"
      open={isAutocompleteOpen}
      onOpen={() => {
        setIsAutocompleteOpen(true)
      }}
      onClose={() => {
        setIsAutocompleteOpen(false)
      }}
      onChange={(_, newValue) => {
        if (newValue === null) {
          sendSearch("CLEAR_RESULTS")
        }

        onChange(newValue)
      }}
      getOptionSelected={(option, value) => option.id === value.id}
      getOptionLabel={(option) =>
        isGroup(option) ? option.name : option.email
      }
      renderOption={(option) => {
        const isOptionGroup = isGroup(option)

        return (
          <AvatarData
            title={isOptionGroup ? option.name : option.username}
            subtitle={isOptionGroup ? getGroupSubtitle(option) : option.email}
            highlightTitle
            avatar={
              !isOptionGroup && option.avatar_url ? (
                <img
                  className={styles.avatar}
                  alt={`${option.username}'s Avatar`}
                  src={option.avatar_url}
                />
              ) : null
            }
          />
        )
      }}
      options={options}
      loading={searchState.matches("searching")}
      className={styles.autocomplete}
      renderInput={(params) => (
        <TextField
          {...params}
          margin="none"
          variant="outlined"
          placeholder="搜索用户或用户组"
          InputProps={{
            ...params.InputProps,
            onChange: handleFilterChange,
            endAdornment: (
              <>
                {searchState.matches("searching") ? (
                  <CircularProgress size={16} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

export const useStyles = makeStyles((theme) => {
  return {
    autocomplete: {
      width: "300px",

      "& .MuiFormControl-root": {
        width: "100%",
      },

      "& .MuiInputBase-root": {
        width: "100%",
        // Match button small height
        height: 36,
      },

      "& input": {
        fontSize: 14,
        padding: `${theme.spacing(0, 0.5, 0, 0.5)} !important`,
      },
    },

    avatar: {
      width: theme.spacing(4.5),
      height: theme.spacing(4.5),
      borderRadius: "100%",
    },
  }
})
